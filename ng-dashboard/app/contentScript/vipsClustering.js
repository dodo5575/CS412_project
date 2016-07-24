//Initialization
vips = new VipsAPI(); //our API
globalBlocks = vips.getVisualBlockList(); //the list that contains your data, each item is a data element

//Your algorithm to analyze the data is here
//The following code manually specifies the result as a list of IDs.
//http://infolab.stanford.edu/db_pages/members.html 
/*************************************************************/

console.log("Clustering");

function removeBlank(List) {
    var newList = [];
    for (var i = 0; i < List.length; i++) {
        if (List[i] != "") {
            newList.push(List[i]);
        }
    }
    return newList;              
}

function getMinMaxOf2DIndex (arr, idx) {
    return {
        min: Math.min.apply(null, arr.map(function (e) { return e[idx]})),
        max: Math.max.apply(null, arr.map(function (e) { return e[idx]}))
    }
} 

var colors = ["red", "blue"];

//// Only look for sub blocks
var pattern2 = new RegExp("^[0-9]*-[0-9]*-([0-9]*)$", "m");

var pattern3 = new RegExp("[^A-Za-z0-9_]+", "m");

var data = [];
var vipsId = [];
var id = [];

//// Collect 
for (var i = 0; i < globalBlocks.length; i++) {

    if (pattern2.test(globalBlocks[i]['-vips-id'])) {

        var reMatchArray = pattern2.exec(globalBlocks[i]['-vips-id']);

        var rawList = globalBlocks[i]['-att-textContent'].split(pattern3);
        
        List = removeBlank(rawList);
        
        // Features [subblock number, word count]
        data.push([parseInt(reMatchArray[1], 10), List.length]);
        vipsId.push(globalBlocks[i]['-vips-id']);
        id.push(i);
    }
}


//// Set id for tracking purposes
data.forEach(function(block, i) {
    block.vipsId = vipsId[i];
});
data.forEach(function(block, i) {
    block.id = id[i];
});

//console.table(data);


//// Normalization
for (var i = 0; i < data[0].length; i++) {

    minMax = getMinMaxOf2DIndex(data, i); 
    range = minMax.max - minMax.min;

    for (var j = 0; j < data.length; j++) {
        data[j][i] = (data[j][i] - minMax.min) / range;
    }
}

//console.table(data);


//// Actual clustering
var clusters = clusterfck.kmeans(data, 2);


//// Highlight and label the cluster number on each box
for (var i = 0; i < clusters.length; i++) {

    boxStyle = "2px solid " + colors[i];
    for (var j = 0; j < clusters[i].length; j++) {

        index = clusters[i][j].id; 

        var box = globalBlocks[index]['-att-box'];
        box.style.border = boxStyle;
        box.title = globalBlocks[i]['-vips-id'];
        box.addEventListener('click', function(e){
                e.preventDefault();
                this.style.border = "4px solid green";
        });
        box.cluster = i;

    }
    console.table(clusters[i]);
}



