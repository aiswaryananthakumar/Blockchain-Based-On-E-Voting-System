$(document).ready(function () {
  // Function to handle wallet ID validation
  function onSignInSubmit() {
      const walletNo = $('#wallet_no').val();
      
      // Check if wallet ID is empty
      if (!walletNo) {
          showError("Wallet ID cannot be empty.");
          return;
      }

      // Hide wallet entry form and show reference form
      $('#enter_walletno').hide();
      $('#verify_ref_model').show();
  }

  // Function to handle reference verification
  $('#verifyref').click(function () {
      const walletNo = $('#wallet_no').val(); // Get the wallet ID from the input field
      const verifyRef = $('#verify_ref').val(); // Get the reference number from the input field

      // Check if reference number is empty
      if (!verifyRef) {
          showError("Reference number cannot be empty.");
          return;
      }

      // Call the backend to verify the wallet and reference
      $.ajax({
          url: '/validate-wallet',
          method: 'POST',
          contentType: 'application/json', // Set content type to JSON
          data: JSON.stringify({           // Convert data to JSON string
              walletId: walletNo,           // Send walletId and refNo
              refNo: verifyRef
          }),
          success: function (response) {
              if (response.status === "success") {
                  // Hide the error and proceed with success
                  $('#errorbox').hide();
                  window.location.href = '/dashboard'; // Redirect to the next page
              } else {
                  showError("Invalid reference number or wallet ID.");
              }
          },
          error: function () {
              showError("An error occurred while verifying the wallet ID and reference number.");
          }
      });
  });

  // Function to show error messages
  function showError(message) {
      $('#error').text(message);
      $('#errorbox').show();
  }

  // Utility function to ensure only numbers are entered
  window.isNumberKey = function (evt) {
      const charCode = (evt.which) ? evt.which : event.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
          return false;
      }
      return true;
  };
});
