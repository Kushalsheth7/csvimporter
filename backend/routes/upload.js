const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { processCSVBatch } = require('../services/llmService');

const router = express.Router();

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Disk storage instead of memory storage for streaming large files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.csv');
  }
});

const upload = multer({ storage: storage });

const BATCH_SIZE = 20;

router.post('/', upload.single('csv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const results = {
    successfullyParsed: [],
    skippedRecords: []
  };

  try {
    const filePath = req.file.path;
    let batch = [];
    let isProcessing = false;
    let isFinishedReading = false;
    let batchCount = 0;

    const processBatch = async (currentBatch) => {
      batchCount++;
      console.log(`Processing streaming batch ${batchCount}...`);
      try {
        const extractedRecords = await processCSVBatch(currentBatch);
        extractedRecords.forEach((record, idx) => {
          const originalRow = currentBatch[idx];
          const hasEmail = record.email && record.email.trim() !== '';
          const hasMobile = record.mobile_without_country_code && record.mobile_without_country_code.trim() !== '';
          
          if (!hasEmail && !hasMobile) {
            results.skippedRecords.push({
              reason: 'Missing both email and mobile number',
              original_row: originalRow,
              extracted: record
            });
          } else {
            results.successfullyParsed.push(record);
          }
        });
      } catch (err) {
        console.error("Batch processing error:", err);
        currentBatch.forEach(row => {
           results.skippedRecords.push({
              reason: 'AI processing failed for this batch',
              original_row: row,
              error: err.message
           });
        });
      }
    };

    // Incremental streaming parser
    const readStream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (data) => {
        batch.push(data);
        if (batch.length >= BATCH_SIZE) {
          // Pause reading while processing batch
          readStream.pause();
          const currentBatch = [...batch];
          batch = [];
          
          await processBatch(currentBatch);
          
          // Resume reading after batch completes
          readStream.resume();
        }
      })
      .on('end', async () => {
        isFinishedReading = true;
        // Process any remaining items in the final batch
        if (batch.length > 0) {
          await processBatch(batch);
        }
        
        // Clean up temp file
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting temp file:', err);
        });

        // Send final results
        res.json({
          total_imported: results.successfullyParsed.length,
          total_skipped: results.skippedRecords.length,
          successfully_parsed: results.successfullyParsed,
          skipped_records: results.skippedRecords
        });
      })
      .on('error', (error) => {
        console.error("Stream reading error:", error);
        res.status(500).json({ error: 'Internal server error processing CSV stream' });
      });

  } catch (error) {
    console.error("Upload route error:", error);
    res.status(500).json({ error: 'Internal server error processing CSV' });
  }
});

module.exports = router;
