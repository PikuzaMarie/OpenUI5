/*global location history */
sap.ui.define([
		"zjblessons/Worklist/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/Worklist/model/formatter",
		"sap/ui/model/Sorter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/Fragment",
		"sap/base/util/Version",
		"sap/ui/unified/Calendar"
	], function (BaseController,
	JSONModel,
	formatter,
	Sorter,
	Filter,
	FilterOperator,
	Fragment,
	Version,
	Calendar) {
		"use strict";

		return BaseController.extend("zjblessons.Worklist.controller.Worklist", {

			formatter: formatter,

			onInit : function () {
				const oViewModel = new JSONModel({
					sCount: '0',
					DocumentNumber: "",
					PlantText: "",
					RegionText: "",
					Description: ""
				});

				this.setModel(oViewModel, "worklistView");

			},

			onBeforeRendering: function() {
				this._bindTable();
			},

			_bindTable() {
				const oTable = this.getView().byId('table');

				oTable.bindItems({
					path: '/zjblessons_base_Headers',
					sorter: [
						new Sorter('DocumentDate', true)
					],
					template: this._getTableTemplate(),
					urlParameters: {
						$select:'HeaderID,DocumentNumber,DocumentDate,PlantText,RegionText,Description,Created'
					},
					events: {
						dataRequested: (oData) => {
							this._getTableCounter();
						}
					}

				});

			},

			_getTableCounter() {
				this.getModel().read('/zjblessons_base_Headers/$count', {
					success: (sCount) => {
						this.getModel('worklistView').setProperty('/sCount', sCount);
					}
				});
			},

			_getTableTemplate() {
				const oTemplate = new sap.m.ColumnListItem({
					type: 'Navigation',
					navigated: true,
					cells: [
						new sap.m.Text({
							text: '{DocumentNumber}'
						}),
						new sap.m.Text({
							text: '{DocumentDate}'
						}),
						new sap.m.Text({
							text: '{PlantText}'
						}),
						new sap.m.Text({
							text: '{RegionText}'
						}),
						new sap.m.Text({
							text: '{Description}'
						}),
						new sap.m.Text({
							text: '{Created}'
						}),
						new sap.m.Button({
							type: 'Transparent',
							icon: this.getResourceBundle().getText('iDecline'),
							press: this.onPressDelete.bind(this)

						})
					]
				});

				return oTemplate;
			},

			onPressDelete(oEvent) {
				const oBindingContext = oEvent.getSource().getBindingContext();

				const sKey = this.getModel().createKey('/zjblessons_base_Headers', {
					HeaderID: oBindingContext.getProperty('HeaderID')
				});

				this.getModel().remove(sKey);

			},

			onSearchDocNum(oEvent) {
				const sValue = oEvent.getParameter('value');
				this._searchHandlerDocNum(sValue);
			},

			onLiveSearchDocNum(oEvent) {
				const sValue = oEvent.getParameter('value');
				this._searchHandlerDocNum(sValue);
			},

			_searchHandlerDocNum(sValue) {
				const oTable = this.getView().byId('table');
				const oFilter = [sValue && sValue.length > 0 ? new Filter('DocumentNumber', FilterOperator.Contains, sValue) : []];

				oTable.getBinding('items').filter(oFilter);
			},

			onSearchPlantTxt(oEvent) {
				const sValue = oEvent.getParameter('value');
				this._searchHandlerPlantTxt(sValue);
			},

			onLiveSearchPlantTxt(oEvent) {
				const sValue = oEvent.getParameter('value');
				this._searchHandlerPlantTxt(sValue);
			},

			_searchHandlerPlantTxt(sValue) {
				const oTable = this.getView().byId('table');
				const oFilter = [sValue && sValue.length > 0 ? new Filter('PlantText', FilterOperator.EQ, sValue) : []];

				oTable.getBinding('items').filter(oFilter);
			},

			onPressCreate() {
				this._loadCreateDialog();
			},

			_loadCreateDialog: async function() {
				this._oDialog = await Fragment.load({
					name: 'zjblessons.Worklist.view.fragment.CreateDialog',
					controller: this,
					id: 'Dialog'
				}).then(oDialog => {
					this.getView().addDependent(oDialog);
					return oDialog
				});

				this._oDialog.open();
			},

			onDialogBeforeOpen(oEvent) {
				const oDialog = oEvent.getSource();
				
				const oParams = {
					HeaderID: '0',
					Version: 'A',
					IntegrationID: null
				},

				oEntry = this.getModel().createEntry('/zjblessons_base_Headers', {
					properties: oParams
				});

				oDialog.setBindingContext(oEntry);

			},

			onPressSave() {
				this.getModel().submitChanges();
				this._oDialog.close();

			},

			onPressCancel() {
				this.getModel().resetChanges();
				this._oDialog.close();
			}

		});
	}
);