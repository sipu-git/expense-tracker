import { Request, Response } from "express";
import { extractReceiptData } from "../services/receiptExtraction.service";
import { AppError } from "../../../../lib/AppError";

// controllers/expense.controller.ts
export async function extractReceiptController(req: Request, res: Response) {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded',400);
    }

    const data = await extractReceiptData(req.file.buffer, req.file.mimetype);

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Receipt extraction failed:', err);
    return res.status(500).json({
      success: false,
      error: 'Could not extract data from receipt. Please enter manually.',
    });
  }
}