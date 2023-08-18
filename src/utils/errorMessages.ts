export const showErrorMessage = (status: number | string | null): string => {
  switch (status) {
    case 1010:
      return 'Invalid Transaction: Inability to pay some fees , e.g. account balance too low. \nYou must have a minimum balance of 500 $IMBUE';
    case 'NotEnoughFundsForStorageDeposit':
      return 'Inability to pay some fees , e.g. account balance too low. \nYou must have a minimum balance of 500 $IMBUE';
    case 'MustBeApplicant':
      return 'You must continue with the wallet used for application';
    default:
      return "Something went wrong. Please try again";
  }
};
