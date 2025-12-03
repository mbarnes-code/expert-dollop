/**
 * Queue Image Generation API
 * Queues combo image generation as a background job
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { queueComboSearch } from '../../../../lib/queue.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cardNames, colorIdentity, commanderFormat, minCards, maxCards } = req.body;

  try {
    const job = await queueComboSearch({
      cardNames: cardNames || undefined,
      colorIdentity: colorIdentity || undefined,
      commanderFormat: commanderFormat || false,
      minCards: minCards || undefined,
      maxCards: maxCards || undefined,
    });

    res.status(202).json({
      success: true,
      jobId: job.id,
      message: 'Combo search queued successfully',
    });
  } catch (error) {
    console.error('Error queueing combo search:', error);
    res.status(500).json({ error: 'Failed to queue combo search' });
  }
}
