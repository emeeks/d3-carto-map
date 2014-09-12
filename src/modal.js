"use strict";

var d3 = require("d3"),
    Map = require("./map"),
    Layer = require("./layer");

var Modal = module.exports = function() {
        var d3Modal = d3.select(),
	d3ModalContent,
        d3ModalParentDiv,
        d3ModalParentG,
        d3ModalCurrentElement,
        createModalContent,
        d3ModalType
        ;

    function d3CartoModal(incomingD) {
        d3ModalCurrentElement = this;
        d3ModalParentDiv.selectAll("div.d3MapModal").remove();

        d3Modal = d3ModalParentDiv.append("div")
        .attr("class", "d3MapModal");

        d3Modal
        .append("div")
        .attr("class", "d3MapModalContent")
        .html(createModalContent(incomingD));

        d3Modal
        .append("div")
        .attr("class", "d3MapModalArrow");

        d3CartoModal.repositionModal();
    }
    
    d3CartoModal.parentDiv = function(newParent) {
	if (!arguments.length) return d3ModalParentDiv;
	d3ModalParentDiv = newParent;
	return this;
    }

    d3CartoModal.parentG = function(newParent) {
	if (!arguments.length) return d3ModalParentG;
	d3ModalParentG = newParent;
	return this;
    }
    
    d3CartoModal.type = function(newType) {
	if (!arguments.length) return d3ModalType;
	d3ModalType = newType;
	return this;
    }
    
    d3CartoModal.repositionModal = function() {
    if (d3Modal.size() == 0) {
        return false}
        
            var modalHeight = parseFloat(d3Modal.node().clientHeight || d3Modal.node().parentNode.clientHeight);
            var modalWidth = parseFloat(d3Modal.node().clientWidth || d3Modal.node().parentNode.clientWidth);
        if (d3ModalType == "Point") {
            var tP = d3.transform(d3.select(d3ModalCurrentElement).attr("transform"));
            var tG = d3.transform(d3ModalParentG.attr("transform"));
            var newLeft = (tP.translate[0] * tG.scale[0]) + tG.translate[0] - (modalWidth / 2);
            var newTop = (tP.translate[1] * tG.scale[1]) + tG.translate[1] - modalHeight - 20;
        }
        else {
            var _m = d3.mouse(d3ModalParentDiv.node())
            var newLeft = _m[0] - (modalWidth / 2);
            var newTop = _m[1] - modalHeight - 20
        }
        
        d3.select("div.d3MapModal")
        .style("left", newLeft + "px")
        .style("top", newTop + "px");
        
        d3.select("div.d3MapModalArrow").style("left", ((modalWidth / 2) - 20) + "px")
        return true;
    }

    d3CartoModal.formatter = function(newFormatter) {
	if (!arguments.length) return createModalContent;
	createModalContent = newFormatter;
	return this;
    }
    
    createModalContent = function(d) {
        var mLabel;
        var mContent = d;
        var mOutput = "";
        if (d.properties) {
            mContent = d.properties;
        }
        for (var x in mContent) {
            if (x.toLowerCase() == "label") {
                mLabel = x;
                break;
            }
            if (x.toLowerCase() == "name") {
                mLabel = x;
                break;
            }
        }
        if (mLabel) {
            mOutput += "<h1>" + mContent[mLabel] + "</h2>"
        }
        for (var x in mContent) {
            if (x.toLowerCase != mLabel && x != "_d3Map") {
                mOutput += "<p>" + x.toUpperCase() + ": " + mContent[x] +"</p>";
            }
        }
        return mOutput;

    }
    
    return d3CartoModal;
}