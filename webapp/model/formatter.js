sap.ui.define([
	] , function () {
		"use strict";

		return {

			numberUnit : function (sValue) {
				if (!sValue) {
					return "";
				}
				return parseFloat(sValue).toFixed(2);
			},

			formatMediumDate(oDate) {
				if (!oDate) {
					return "";
				}
				const oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					style: "medium"
				});
				return oDateFormat.format(new Date(oDate));
			}

		};

	}
);