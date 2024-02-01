const pages = [
  "#password",
  "#expand_err1554",
  "#expand_fixPay",
  "#expand_Support",
];
const buttoms = ["#change_password", "#err1554", "#fixPay", "#call_support"];

function hideContent() {
  pages.forEach((element) => {
    $(element).hide();
  });
  if ($("#ch_pass_req").attr("value") === "done") {
    $("#password").show();
    $("#ch_pass_req").attr("value", null);
  }
}

function showContent() {
  hideContent();
  buttoms.forEach((element) => {
    $(element).on("click", (event) => {
      switch (event.target.id) {
        case "change_password":
          hideContent();
          $("#password").show();
          break;
        case "err1554":
          hideContent();
          $("#expand_err1554").show();
          break;
        case "fixPay":
          hideContent();
          $("#expand_fixPay").show();
          break;
        case "call_support":
          hideContent();
          $("#expand_Support").show();
          break;
        default:
          console.log("default");
      }
    });
  });
}

function loading() {
  $(".submitButtom").on("click", (event) => {
    console.log($(".submitField").val())
    if ($(".submitField").val().length === 8) {
      $("#loading").removeClass("hideElement");
      console.log('click')

    }
  });
}

showContent();
loading();
