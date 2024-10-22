/*global location*/
sap.ui.define([
		"zjblessons/Worklist/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"zjblessons/Worklist/model/formatter",
		"sap/m/MessageToast"
	], function (
		BaseController,
	JSONModel,
	History,
	formatter,
	MessageToast
	) {
		"use strict";

		return BaseController.extend("zjblessons.Worklist.controller.Object", {

			formatter: formatter,

			onInit : function () {
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0,
						isEditMode: false,
						sSelectedTab: "List"
					});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				// Store original busy indicator delay, so it can be restored later on
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "objectView");
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					}
				);
			},

			onNavBack : function() {
				var sPreviousHash = History.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("worklist", {}, true);
				}
			},

			_onObjectMatched : function (oEvent) {
				var sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("zjblessons_base_Headers", {
						HeaderID :  sObjectId
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));
			},

			_bindView : function (sObjectPath) {
				var oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel();

				this.getView().bindElement({
					path: sObjectPath,
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								oViewModel.setProperty("/busy", true);
							});
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getModel("objectView"),
					oElementBinding = oView.getElementBinding();

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}
				oViewModel.setProperty("/busy", false);
			},

			onEdit() {
				this.getView().getModel("objectView").setProperty('/isEditMode', true);
			},

			onCancel() {
				const oViewModel = this.getView().getModel("objectView");
				oViewModel.setProperty("/isEditMode", false);
				this.getModel().resetChanges();
			},
			onSave() {
				const oViewModel = this.getView().getModel("objectView");
				const oModel = this.getView().getModel();

				oModel.submitChanges({
					success: function() {
						MessageToast.show("Changes were saved");
						oViewModel.setProperty("/isEditMode", false);
						this._refreshObject();
					}.bind(this),
					error: function() {
						MessageToast.show("Error saving changes");
					}
				});
			},
			_refreshObject() {
				const sObjectPath = this.getView().getElementBinding().getPath();
				this.getView().bindElement({
					path: sObjectPath,
					refreshAfterChange: true
				});
			},
			onDelete() {
				const oModel = this.getView().getModel();
				const sPath = this.getView().getBindingContext().getPath();

				oModel.remove(sPath, {
					success: function() {
						MessageToast.show("Record deleted successfully");
						this.getRouter().navTo("worklist");
					}.bind(this),
					error: function() {
						MessageToast.show("Error deleting record");
					}
				});
			}			

		});

	}
);