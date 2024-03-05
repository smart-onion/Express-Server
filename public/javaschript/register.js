$("table tr").each(function (i) {
    // Do something with each row
    var row = $(this).find("td:eq(1)").text(); // Get the content of the second cell in the current row
    $(this).on("click", function () {
      $.ajax({
        url: "/users/register",
        type: "DELETE",
        data: { username: row },
        success: function(response) {
          console.log("Delete request successful:", response);
          // Optionally, you can reload the page after the DELETE request completes
        },
        error: function(xhr, status, error) {
          console.error("Error in DELETE request:", error);
        }
      });
      


    });
  });
  