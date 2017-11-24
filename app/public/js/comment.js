$(document).ready(function(){
  displayComments();
});

function displayComments() {
    $('#discussions tr').has('td').remove();
    document.getElementById("comment").value = "";

    $.ajax({
        type: "POST",
        data: {},
        url: "/displayComments",
        success: function (data) {
            for(var i = 0; i <data.length; i++) {
                var table = document.getElementById("discussions");
                var row = table.insertRow(-1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                cell1.innerHTML = data[i].username;
                cell2.innerHTML = data[i].comment;
            }
        }
    });
}

document.getElementById("post_button").addEventListener("click", updateComments);

function updateComments() {
    $('#discussions tr').has('td').remove();
    var comment = document.getElementById("comment").value;
    $.ajax({
        type: "POST",
        data: {comment: comment},
        url: "/updateComments",
        success: function (response) {
            if(response) {
                displayComments();
            }

        }
    });

}

