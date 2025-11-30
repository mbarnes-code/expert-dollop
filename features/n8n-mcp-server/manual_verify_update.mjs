import { N8nApiClient } from './build/api/client.js';
import { getEnvConfig, loadEnvironmentVariables } from './build/config/environment.js';
import { N8nApiError } from './build/errors/index.js';

async function main() {
  console.log('Attempting to load environment configuration...');
  loadEnvironmentVariables(); // Load .env file if present and needed
  const config = getEnvConfig(); // Get validated config object

  if (!config.n8nApiUrl || !config.n8nApiKey) {
    console.error('Error: N8N_API_URL and/or N8N_API_KEY are not set.');
    console.error('Please set these environment variables to run this verification.');
    process.exit(1);
  }

  console.log(`N8N API URL: ${config.n8nApiUrl}`);
  console.log('N8N API Key: EXISTS (not printing value)');
  config.debug = true; // Enable debug logging for the client

  const client = new N8nApiClient(config);

  try {
    console.log('Checking connectivity...');
    await client.checkConnectivity();
    console.log('Connectivity check successful.');

    console.log('Fetching workflows to find one to update...');
    let workflows = await client.getWorkflows();

    if (!workflows || workflows.length === 0) {
      console.log('No workflows found. Cannot test update.');
      // If no workflows, try to create one, then update it.
      console.log('Attempting to create a dummy workflow for testing update...');
      const newWorkflowData = {
        name: 'Test Workflow for Update Verification',
        nodes: [
          {
            parameters: {},
            id: '0743771a-291a-4763-ab03-570546a05f70',
            name: 'When Webhook Called',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [480, 300],
            webhookId: 'test-webhook-id'
          }
        ],
        connections: {},
        active: false,
        settings: { executionOrder: 'v1' },
        tags: [] // Intentionally include tags to see if they are filtered
      };
      let createdWorkflow;
      try {
        createdWorkflow = await client.createWorkflow(newWorkflowData);
        console.log(`Successfully created workflow with ID: ${createdWorkflow.id}, Name: ${createdWorkflow.name}`);
        workflows.push(createdWorkflow); // Add to list to proceed with update
      } catch (createError) {
        console.error('Failed to create a dummy workflow:', createError);
        if (createError instanceof N8nApiError) {
          console.error(`N8nApiError Details: Status ${createError.status}, Message: ${createError.message}`);
          if (createError.cause) console.error('Cause:', createError.cause);
        }
        process.exit(1);
      }
    }

    if (!workflows || workflows.length === 0) {
        console.log('Still no workflows found after attempting creation. Cannot test update.');
        process.exit(0); // Exit gracefully, can't test.
    }

    const workflowToUpdate = workflows[0];
    const originalName = workflowToUpdate.name;
    const newName = `Updated - ${originalName} - ${Date.now()}`;

    console.log(`Attempting to update workflow ID: ${workflowToUpdate.id}, Original Name: "${originalName}"`);
    console.log(`New Name will be: "${newName}"`);

    // Construct the update payload. Include fields that should be stripped.
    const updatePayload = {
      ...workflowToUpdate, // Spread the existing workflow
      name: newName,       // Change the name
      // Explicitly include fields that should be removed by updateWorkflow
      id: workflowToUpdate.id,
      createdAt: workflowToUpdate.createdAt || '2023-01-01T00:00:00Z',
      updatedAt: workflowToUpdate.updatedAt || '2023-01-01T00:00:00Z',
      tags: workflowToUpdate.tags || [{ id: 'testtag', name: 'Test Tag' }]
    };

    // Remove nodes and connections if they are very large to avoid log clutter
    // and potential issues if they are not meant to be sent in full for simple updates.
    // The PR is about filtering metadata, not changing core workflow structure via update.
    delete updatePayload.nodes;
    delete updatePayload.connections;


    console.log('Workflow object before sending to updateWorkflow (with fields that should be stripped):', JSON.stringify(updatePayload, null, 2));

    const updatedWorkflow = await client.updateWorkflow(workflowToUpdate.id, updatePayload);

    if (updatedWorkflow.name === newName) {
      console.log(`SUCCESS: Workflow updated successfully! New name: "${updatedWorkflow.name}"`);
      console.log('Received updated workflow object:', JSON.stringify(updatedWorkflow, null, 2));

      // Optional: try to revert the name
      try {
        console.log(`Attempting to revert name for workflow ID: ${workflowToUpdate.id} to "${originalName}"`);
        await client.updateWorkflow(workflowToUpdate.id, { name: originalName });
        console.log(`Successfully reverted name to "${originalName}"`);
      } catch (revertError) {
        console.error('Failed to revert workflow name, but the main update test passed:', revertError);
      }

    } else {
      console.error(`FAILURE: Workflow name was not updated as expected. Expected: "${newName}", Got: "${updatedWorkflow.name}"`);
      process.exit(1);
    }

  } catch (error) {
    console.error('Manual verification script failed:');
    if (error instanceof N8nApiError) {
      console.error(`N8nApiError Details: Status ${error.status}, Message: ${error.message}`);
      if (error.cause) console.error('Cause:', error.cause);
    } else if (error.isAxiosError) {
      console.error('Axios Error:', error.message);
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
