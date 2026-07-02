const calculateRentHistory = ({
  monthlyRent = 0,
  depositAmount = 0,
  daysCount = 30,

  previousDue = 0,

  ebAmt = 0,
  flatEB = 0,

  adjEB = 0,
  adjAmt = 0,

  processingFees = 0,
  processingFeesReceived = 0,

  depositAmountReceived = 0,

  rentReceived = 0,
}) => {
  monthlyRent = Number(monthlyRent);
  depositAmount = Number(depositAmount);
  daysCount = Number(daysCount);

  previousDue = Number(previousDue);

  ebAmt = Number(ebAmt);
  flatEB = Number(flatEB);

  adjEB = Number(adjEB);
  adjAmt = Number(adjAmt);

  processingFees = Number(processingFees);
  processingFeesReceived = Number(processingFeesReceived);

  depositAmountReceived = Number(
    depositAmountReceived
  );

  rentReceived = Number(rentReceived);

  // Rent
  const rentAmt =
    (monthlyRent / 30) * daysCount;

  // Due
  const processingFeesDue =
    processingFees -
    processingFeesReceived;

  const depositAmountDue =
    depositAmount -
    depositAmountReceived;

  // Receivable
  const totalReceivable =
    previousDue +
    rentAmt +
    ebAmt +
    flatEB +
    processingFees -
    adjAmt -
    adjEB;

  // Total Received
  const totalReceived =
    rentReceived;

  // Current Due
  const currentDue =
    totalReceivable -
    totalReceived;

  // Payment Status
  let paymentStatus = "Pending";

  if (currentDue <= 0) {
    paymentStatus = "Paid";
  } else if (totalReceived > 0) {
    paymentStatus = "Partial";
  }

  return {
    monthlyRent,
    depositAmount,

    daysCount,

    rentAmt,

    previousDue,

    ebAmt,
    flatEB,

    adjEB,
    adjAmt,

    processingFees,
    processingFeesReceived,
    processingFeesDue,

    depositAmountReceived,
    depositAmountDue,

    totalReceivable,
    totalReceived,
    currentDue,

    paymentStatus,
  };
};

module.exports = calculateRentHistory;