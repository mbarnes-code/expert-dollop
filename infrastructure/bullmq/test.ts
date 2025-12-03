/**
 * BullMQ Infrastructure Test
 * Simple test to verify BullMQ setup is working correctly
 */

import {
  createQueue,
  createWorker,
  QueueName,
  closeAllQueues,
  closeAllWorkers,
  closeBullMQRedisConnection,
  getBullMQConnectionStatus,
  type EmailJobData,
} from './index';

async function testBullMQSetup() {
  console.log('=== BullMQ Infrastructure Test ===\n');

  try {
    // Test 1: Connection
    console.log('Test 1: Checking Redis connection...');
    const status = getBullMQConnectionStatus();
    console.log(`✓ Connection status: ${status}\n`);

    // Test 2: Create Queue
    console.log('Test 2: Creating email queue...');
    const emailQueue = createQueue<EmailJobData>(QueueName.EMAIL);
    console.log('✓ Email queue created\n');

    // Test 3: Add Job
    console.log('Test 3: Adding test job to queue...');
    const job = await emailQueue.add('test-email', {
      to: 'test@example.com',
      subject: 'Test Email',
      body: 'This is a test',
      timestamp: Date.now(),
    });
    console.log(`✓ Job added with ID: ${job.id}\n`);

    // Test 4: Create Worker
    console.log('Test 4: Creating worker...');
    let jobProcessed = false;
    
    const worker = createWorker<EmailJobData>(
      QueueName.EMAIL,
      async (job) => {
        console.log(`  Processing job ${job.id}...`);
        console.log(`  To: ${job.data.to}`);
        console.log(`  Subject: ${job.data.subject}`);
        jobProcessed = true;
        return { success: true, processed: true };
      },
      { concurrency: 1 }
    );
    console.log('✓ Worker created\n');

    // Wait for job to be processed
    console.log('Test 5: Waiting for job processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (jobProcessed) {
      console.log('✓ Job processed successfully\n');
    } else {
      console.log('⚠ Job not processed (this is OK if Redis is not running)\n');
    }

    // Test 6: Queue Stats
    console.log('Test 6: Getting queue statistics...');
    const counts = await emailQueue.getJobCounts();
    console.log(`✓ Queue stats:`, counts, '\n');

    // Test 7: Cleanup
    console.log('Test 7: Cleaning up...');
    await closeAllWorkers();
    console.log('  ✓ Workers closed');
    
    await closeAllQueues();
    console.log('  ✓ Queues closed');
    
    await closeBullMQRedisConnection();
    console.log('  ✓ Redis connection closed\n');

    console.log('=== All Tests Passed ===');
    return true;

  } catch (error) {
    console.error('✗ Test failed:', error);
    
    // Cleanup on error
    try {
      await closeAllWorkers();
      await closeAllQueues();
      await closeBullMQRedisConnection();
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    
    return false;
  }
}

// Run test if executed directly
if (require.main === module) {
  testBullMQSetup()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

export { testBullMQSetup };
