const message = {
    notification: {
        title: 'DD Verified Successfully',
        body: `Hello ${customer.name}, your Demand Draft has been verified by ${verifiedBy} on ${new Date().toLocaleDateString()}.`
    },
    data: {
        customerId: customer._id.toString(),
        verificationDate: customer.verifiedAt.toISOString(),
        verifiedBy: verifiedBy
    },
    token: customer.deviceToken,
};


const message = {
    notification: {
        title: 'DD Verified Successfully',
        body: `Hello ${customer.name}, your Demand Draft has been verified by ${verifiedBy} on ${new Date().toLocaleDateString()}. You are now successfully registered!`,
    },
    token: customer.deviceToken,  // Assuming you store the device token for each customer
};


const message = {
    notification: {
        title: 'DD Rejected',
        body: `Hello ${customer.name}, your Demand Draft has been rejected by ${rejectedBy} on ${new Date().toLocaleDateString()} due to: ${rejectionReason}.`
    },
    data: {
        customerId: customer._id.toString(),
        rejectionDate: customer.rejectedAt.toISOString(),
        rejectedBy: rejectedBy,
        rejectionReason: rejectionReason
    },
    token: customer.deviceToken,
};

//  customer details name
// executive name rejection reason

const message = {
    notification: {
        title: 'DD Rejected',
        body: `Hello ${customer.name}, your Demand Draft has been rejected by ${rejectedBy} on ${new Date().toLocaleDateString()} due to: ${rejectionReason}. Please upload a valid document.`,
    },
    token: customer.deviceToken,  // Assuming you store the device token for each customer
};


