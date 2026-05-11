
export const calculatePaymentSplit = (amount, adminPercent = 20) => {
  const total = Number(amount || 0);
  const commissionPercent = Number(adminPercent || 0);

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("Amount should be greater than zero");
  }

  if (!Number.isFinite(commissionPercent) || commissionPercent < 0 || commissionPercent > 100) {
    throw new Error("Admin commission percent must be between 0 and 100");
  }

  const adminCommissionAmount = Number(((total * commissionPercent) / 100).toFixed(2));
  const editorPayoutAmount = Number((total - adminCommissionAmount).toFixed(2));

  return {
    totalAmount: total,
    adminCommissionPercent: commissionPercent,
    adminCommissionAmount,
    editorPayoutAmount,
  };
};