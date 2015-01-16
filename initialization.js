pmc = {};
pmc.searchToJSON = function() {
	try {
		var rep = {
			'?' : '{"',
			'=' : '":"',
			'&' : '","'
		};

		var s_searchToJSON = document.location.search.replace(/[\?]+[\&]+/g, "?");
		if ((s_searchToJSON.match(/\&$/gi)) != null) {
			s_searchToJSON = s_searchToJSON.substring(0, s_searchToJSON.length - 1);
		}
		s_searchToJSON = s_searchToJSON.replace(/[\&]+/g, "&");
		s_searchToJSON = s_searchToJSON.replace(/[\?\=\&]/g, function(r) {
			return rep[r];
		});

		return JSON.parse(s_searchToJSON.length ? s_searchToJSON + '"}' : "{}");
	} catch (e) {
		return {};
	}
};

pmc.removeHTML = function(str) {
	try {
		var div = document.createElement('div');
		div.innerHTML = str;
		if (typeof dojo == "undefined") {
			return str;
		} else {
			return dojo.query(div).text();
		}
	} catch (e) {
		return str;
	}
};

pmc.roundValue = function(value, n) {
	return Math.round(Math.pow(10, n) * value) / Math.pow(10, n);
};

pmc.getProductString = function(pArray) {
	var completeString = "", currentProd = {}, paLen = pArray.length, i = 0;

	for (; i < paLen; i++) {
		currentProd = pArray[i];
		currentProd.category = "";
		// Always empty.
		completeString += currentProd.category + ";";
		completeString += currentProd.description + ";";

		var quantity = currentProd.quantity * 1;
		var price = currentProd.price;

		if (!isNaN(quantity) && !isNaN(price)) {
			// Issue #15602
			price = pmc.roundValue((price), 2);
		} else {
			if (isNaN(quantity)) {
				quantity = '';
			}
			if (isNaN(price)) {
				price = '';
			}
		}
		if (quantity == 0 || quantity == "0") {
			quantity = "";
			completeString += quantity + ";";
		} else {
			completeString += quantity + ";";
		}

		if (price == 0 || price == "0") {
			price = "";
			completeString += "" + ";";
		} else {
			completeString += pmc.roundValue((quantity * price), 2) + ";";
		}

		if (currentProd.purchaseIncrementorEvents.length > 0) {
			var incrementor = [];
			//console.log(currentProd.purchaseIncrementorEvents);
			for (var j = 0; j < currentProd.purchaseIncrementorEvents.length; j++) {
				//console.log(currentProd.purchaseIncrementorEvents[j].eventName + "=" + currentProd.purchaseIncrementorEvents[j].value);
				incrementor.push(currentProd.purchaseIncrementorEvents[j].eventName + "=" + currentProd.purchaseIncrementorEvents[j].value);
			}
			//console.log(incrementor.join("|"));
			completeString += incrementor.join("|");
			if (currentProd.purchaseMerchandisingEvars.length > 0) {
				completeString += ";";
			}
		}
		if (currentProd.purchaseMerchandisingEvars.length > 0) {

			if (currentProd.purchaseIncrementorEvents.length == 0) {
				completeString += ";";
			}
			var incrementor = [];
			for (var j = 0; j < currentProd.purchaseMerchandisingEvars.length; j++) {
				incrementor.push(currentProd.purchaseMerchandisingEvars[j].evarName + "=" + currentProd.purchaseMerchandisingEvars[j].value);
			}
			completeString += incrementor.join("|");
		}

		if (i < paLen - 1) { 
			completeString += ",";
		}
	}
	return completeString;
};

pmc.updateCategoryRefinements = function(c) {
	//console.log(c);
	if(digitalData.page.attributes.refinements.types) {
	    utag_data["pmc_prop16"] = pmc.prop16 = (c.page.attributes.refinements.types[0]).toLowerCase();    //last type
	    utag_data["pmc_prop17"] = pmc.prop17 = (c.page.attributes.refinements.types[0] + ":" + c.page.attributes.refinements.values[0]).toLowerCase(); // last type:value
	    pmc.eVar39 = []; // |-delimited list of types
	    pmc.eVar40 = []; // |-delimited list of types:values
	    
	    for(var i=0; i < c.page.attributes.refinements.types.length; i++) {
	        pmc.eVar39.push(c.page.attributes.refinements.types[i]);
	        pmc.eVar40.push(c.page.attributes.refinements.types[i] + ":" + c.page.attributes.refinements.values[i]);
	    }
	    utag_data["pmc_eVar39"] = pmc.eVar39 = pmc.eVar39.join("|").toLowerCase();
	    utag_data["pmc_eVar40"] = pmc.eVar40 = pmc.eVar40.join("|").toLowerCase();
	    utag.link({
	    	pmc_prop16 : pmc.prop16,
	    	pmc_prop17 : pmc.prop17,
	    	pmc_eVar39 : pmc.eVar39,
	    	pmc_eVar40 : pmc.eVar40,
			pmc_eVar18 : utag_data["pmc_eVar18"],
			pmc_prop18 : utag_data["pmc_prop18"]
	    });
	}
};

pmc.cartReviewProductString = function() {
	pmc.order = pmc.newOrder();
	if (digitalData) {
		if (typeof digitalData.x_cart != "undefined") {
			if (digitalData.x_cart.orders) {
				for (var i = 0; i < digitalData.x_cart.orders.length; i++) {
					if (digitalData.x_cart.orders[i].items) {
	
						for (var h = 0; h < digitalData.x_cart.orders[i].items.length; h++) {
							var item = digitalData.x_cart.orders[i].items[h];
							var orderItem = pmc.newOrderItem();
							orderItem.description = item.productID.prodID;
							
							if (digitalData.component) {
								var componentLength = digitalData.component.length;
								for (var j = 0; j < componentLength; j++) {
									if(typeof(digitalData.component[j].componentID.componentID) != "undefined") {
										if(item.productID.prodID == digitalData.component[j].attributes.groupId && 
											(digitalData.component[j].componentID.componentID.match(/backorder date viewed/i) != null || digitalData.component[j].componentID.componentID.match(/view availability/i)) && 
											typeof(digitalData.component[j].attributes) != "undefined") {
													
												var d2 = new Date(digitalData.component[j].attributes.backorder); 
												var d1 = new Date(); 
												var timeDiff = Math.abs(d2.getTime() - d1.getTime());					
												var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
															 
												utag_data["pmc_event56"] = "event56";
												
												orderItem.purchaseIncrementorEvents.push({
													"eventName" : "event56",
													"value" : 1
												});
												orderItem.purchaseMerchandisingEvars.push({
													"evarName" : "eVar45",
													"value" : "backordered"
												});
												orderItem.purchaseMerchandisingEvars.push({
													"evarName" : "eVar46",
													"value" : diffDays
												});
												orderItem.purchaseMerchandisingEvars.push({
													"evarName" : "eVar33",
													"value" : item.productID.sku
												});
										}
									}
								}
							}	
							
							if(item.quantity) {

								utag_data["pmc_event69"] = "event69";
								orderItem.purchaseIncrementorEvents.push({
									"eventName" : "event69",
									"value" : item.quantity
								});
							}
													
							orderItem.itemTotal = (parseInt(item.quantity) * pmc.roundValue(item.price.unitPrice, 2));
							if(orderItem.itemTotal) {

								utag_data["pmc_event70"] = "event70";
								orderItem.purchaseIncrementorEvents.push({
									"eventName" : "event70",
									"value" : orderItem.itemTotal
								});
							}
							
							orderItem.purchaseMerchandisingEvars.push({
								"evarName" : "eVar33",
								"value" : item.productID.sku
							});
							pmc.order.orderItems.push(orderItem);
						}
					}
				}
			}
		}
	}

	if (pmc.order.orderItems.length > 0) {
		return pmc.getProductString(pmc.order.orderItems);
	} else {
		return "";
	}
};

pmc.purchase = function() {

	if (digitalData) {
		pmc.orders = new Array();
		if (digitalData.x_transaction.orders) {
			for (var i = 0; i < digitalData.x_transaction.orders.length; i++) {
				var order = pmc.newOrder();

				if (digitalData.x_transaction.orders[i].items) {

					order.number = digitalData.x_transaction.orders[i].orderID;
					order.state = digitalData.x_transaction.customer.address.stateProvince;
					order.zip = digitalData.x_transaction.customer.address.postalCode;
					order.eVar5 = digitalData.x_transaction.orders[i].orderID;
					if (digitalData.x_transaction.orders[i].promos != undefined) {
						order.eVar6 = digitalData.x_transaction.orders[i].promos.toString();
					}
					order.eVar7 = digitalData.x_transaction.orders[i].payment.paymentType;
					order.eVar8 = digitalData.x_transaction.orders[i].shiptos[0].shipMethod;
					
					// zero out to clear memory for subsequent calls.
					var emailValue = digitalData.x_transaction.customer.email;
					if (emailValue !== null && typeof (emailValue) !== "undefined") {
						order.eVar43 = emailValue;
						utag_data["pmc_event53"] = "event53";
					}

					if (digitalData.x_transaction.orders[i].price.orderTotal) {
						order.event7 = digitalData.x_transaction.orders[i].price.orderTotal;
					}

					if (digitalData.x_transaction.orders[i].price.shippingTotal) {
						order.event8 = digitalData.x_transaction.orders[i].price.shippingTotal;
					}

					if (digitalData.x_transaction.orders[i].price.surchargeTotal) {
						order.event9 = digitalData.x_transaction.orders[i].price.surchargeTotal;
					}

					if (digitalData.x_transaction.orders[i].price.taxTotal) {
						order.event10 = digitalData.x_transaction.orders[i].price.taxTotal;
					}
					
					if (digitalData.x_transaction.orders[i].price.shippingDiscountTotal) {
						order.event15 = digitalData.x_transaction.orders[i].price.shippingDiscountTotal;
					}
	
					if (digitalData.x_transaction.orders[i].price.giftWrapTotal) {
						order.event38 = digitalData.x_transaction.orders[i].price.giftWrapTotal;
					}
					
					var personalizationDiscount = digitalData.x_transaction.orders[i].price.personalizationDiscountTotal;
					var merchantDiscount = digitalData.x_transaction.orders[i].price.merchDiscount;

					if (personalizationDiscount !== null && typeof (personalizationDiscount) !== "undefined" && personalizationDiscount > 0) {
						order.event14 = personalizationDiscount;
					} else {
						personalizationDiscount = 0;
					}

					var nonPersonalizedDiscount = 0;

					if (merchantDiscount !== null && typeof (merchantDiscount) !== "undefined") {
						nonPersonalizedDiscount = merchantDiscount - personalizationDiscount;
					}

					if (nonPersonalizedDiscount > 0) {
						order.event13 = nonPersonalizedDiscount;
					}
					
					if(digitalData.x_transaction.orders[i].orderType == "registry") {
						order.eVar34 = digitalData.x_transaction.orders[i].items[0].attributes.registryID;
					}
					
				}

				var itemCount = digitalData.x_transaction.orders[i].items.length;
				for (var h = 0; h < itemCount; h++) {
					var item = digitalData.x_transaction.orders[i].items[h];
					var orderItem = pmc.newOrderItem();
					orderItem.description = item.productID.prodID;
					orderItem.itemNumber = item.productID.sku;
					orderItem.shippingOptions = "";
					orderItem.quantity = item.quantity;
					 
					if (item.price.merchDiscount != null && !isNaN(item.price.merchDiscount)) {
						orderItem.price = pmc.roundValue((item.price.unitPrice - item.price.merchDiscount), 2);
					} else {
						orderItem.price = item.price.unitPrice;
					}
					
					orderItem.itemTotal = orderItem.quantity * orderItem.price;
					orderItem.purchaseMerchandisingEvars.push({
						"evarName" : "eVar33",
						"value" : item.productID.sku
					});
					if (item.giftWrapped == true) {
						order.event36 = "event36";
						orderItem.purchaseIncrementorEvents.push({
							"eventName" : "event36",
							"value" : "1"
						});
					}
					
					order.orderItems.push(orderItem);
				}
				
				if (order.orderItems.length > 0) {
					order.productString = pmc.getProductString(order.orderItems);
					pmc.orders.push(order);
				}
			}
		}

		pmc._purchase = "purchase";
		pmc.productString = pmc.orders[0].productString;
		pmc.purchaseID = pmc.orders[0].number;
		pmc.state = pmc.orders[0].state;
		pmc.zip = pmc.orders[0].zip;
		pmc.eVar7 = pmc.orders[0].eVar7;
		pmc.eVar8 = pmc.orders[0].eVar8;
		pmc.eVar5 = pmc.orders[0].eVar5;
		pmc.eVar6 = pmc.orders[0].eVar6;
		pmc.eVar34 = pmc.orders[0].eVar34;
		utag_data["pmc_eVar43"] = pmc.orders[0].eVar43;
		pmc.event36 = pmc.orders[0].event36;

		if (digitalData.page.attributes.expressCheckout === true) {
			pmc.eVar4 = "express";
		} else if (digitalData.x_user && digitalData.x_user.profile) {
			pmc.eVar4 = "authenticated regular";
		} else {
			pmc.eVar4 = "guest regular";
		}
	}
	return;
};

pmc.setSearchResultType = function() {
	if(digitalData.page.attributes.searchResultsType) {
		var searchResultsType = digitalData.page.attributes.searchResultsType.toLowerCase()
		if(searchResultsType === "partialmatch") {
			return "partial-match";
		} else if(searchResultsType === "spellcorrected") {
			return "spell-corrected";
		} else if(searchResultsType === "typeahead") {
			return "type-ahead";
		} else if(searchResultsType === "didyoumean") {
			return "did-you-mean";
		} else {
			return digitalData.page.attributes.searchResultsType.toLowerCase();
		}
	} else {
		return "unknown"
	}
};

pmc.pageViewProductDetailsPage = function() {
 
		if (pmc.eVar42 != "M:PIP INTERSTITIAL") {
			pmc.event18 = "event18";
			pmc.prodView = "prodView";
			if (digitalData.product != undefined && digitalData.product.productID != undefined && digitalData.product.productID.prodID != undefined) {
				utag_data["pmc_pageName"] = "product detail:" + digitalData.product.productID.prodID;
			}

			utag_data["pmc_prop1"] = "product detail";
			utag_data["pmc_prop2"] = "product detail";
			utag_data["pmc_prop3"] = "product detail";
			utag_data["pmc_prop4"] = "product detail";
			utag_data["pmc_prop5"] = "product detail";

			if (digitalData.page.attributes.template == "simple") {
				utag_data["pmc_prop1"] = "product detail:simple pip";
			}
			if (digitalData.page.attributes.template == "complex") {
				utag_data["pmc_prop1"] = "product detail:complex pip";
			}
			if (digitalData.page.attributes.template == "upholstery pip") {
				utag_data["pmc_prop1"] = "product detail:upholstery pip";
			}
			if (digitalData.product.productID.prodID == "gift-card" || digitalData.product.productID.prodID == "gift-cards" || digitalData.product.productID.prodID == "pottery-barn-gift-cards") {
				utag_data["pmc_prop1"] = "product detail:" + digitalData.product.productID.prodID;
			}

			pmc.pip = pmc.newOrder();
			var orderItem = pmc.newOrderItem();

			orderItem.description = digitalData.product.productID.prodID;
			orderItem.purchaseIncrementorEvents.push({
				"eventName" : "event18",
				"value" : 1
			});

			if ( typeof (digitalData.component) != "undefined") {
				var mixedAvailability = false; 
				var componentLength = digitalData.component.length; 
				
				for (var j = 0; j < componentLength && mixedAvailability == false; j++) {
					if ( typeof (digitalData.component[j]) != "undefined") {
						if ( typeof (digitalData.component[j].componentID) != "undefined") {
							if ( typeof (digitalData.component[j].componentID.componentID) != "undefined") {
								if (digitalData.component[j].componentID.componentID.match(/view availability/i) != null && typeof (digitalData.component[j].attributes) != "undefined") {
									if (orderItem.description == digitalData.component[j].attributes.groupId) {
										utag_data["pmc_event55"] = "event55";
				
										orderItem.purchaseIncrementorEvents.push({
											"eventName" : "event55",
											"value" : 1
										});
										orderItem.purchaseMerchandisingEvars.push({
											"evarName" : "eVar45",
											"value" : "mixed availability"
										});
				
										mixedAvailability = true; 
									}
								
								}
							}
						}
					} 
				}
			}
			
			pmc.pip.orderItems.push(orderItem);

			if (typeof (digitalData.product.attributes) != "undefined") {
				if (typeof (digitalData.product.attributes.persistentIDs) != "undefined") {
					if (digitalData.product.attributes.persistentIDs.length > 0) {
						pmc.event19 = "event19";
						
						for (var i = 0; i < digitalData.product.attributes.persistentIDs.length; i++) {
	
							var orderItemSecondary = pmc.newOrderItem();
	
							orderItemSecondary.description = digitalData.product.attributes.persistentIDs[i];
							orderItemSecondary.purchaseIncrementorEvents.push({
								"eventName" : "event19",
								"value" : 1
							});
	
							if ( typeof (digitalData.component) != "undefined") {
								var mixedAvailability = false; 
								var componentLength = digitalData.component.length; 
							 
								for (var j = 0; j < componentLength && mixedAvailability == false; j++) {
									if ( typeof (digitalData.component[j]) != "undefined") {
										if ( typeof (digitalData.component[j].componentID) != "undefined") {
											if ( typeof (digitalData.component[j].componentID.componentID) != "undefined") {
												if (digitalData.component[j].componentID.componentID.match(/view availability/i) && typeof (digitalData.component[j].attributes) != "undefined") {
													if (orderItemSecondary.description == digitalData.component[j].attributes.groupId) {
														utag_data["pmc_event55"] = "event55";
				
														orderItemSecondary.purchaseIncrementorEvents.push({
															"eventName" : "event55",
															"value" : 1
														});
														orderItemSecondary.purchaseMerchandisingEvars.push({
															"evarName" : "eVar45",
															"value" : "mixed availability"
														});
														
														mixedAvailability = true; 
													}
												}
											}
										}
									}
								}
							}
							pmc.pip.orderItems.push(orderItemSecondary);
						}
					}
				}
			}
		
			if(pmc.pip.orderItems.length == 1) {
				if(typeof pmc.pip.orderItems[0].purchaseMerchandisingEvars != "undefined") {
					for(var i = 0; i < pmc.pip.orderItems[0].purchaseMerchandisingEvars.length; i++) {
					    if(pmc.pip.orderItems[0].purchaseMerchandisingEvars[i].evarName == "eVar45" && pmc.pip.orderItems[0].purchaseMerchandisingEvars[i].value == "mixed availability") {
					        pmc.pip.orderItems[0].purchaseMerchandisingEvars[i].value = "backordered";
						}
					}
				}
			}

			if (pmc.pip.orderItems.length > 0) {
				utag_data["pmc_products"] = pmc.productString = pmc.getProductString(pmc.pip.orderItems);
			}

			if (pmc.urlVariables.words != undefined && pmc.urlVariables.words != null && pmc.urlVariables.words != "") {
				// PIP from a redirected search:
				pmc.prop9 = pmc.eVar27 = pmc.urlVariables.words.toLowerCase();
				pmc.prop10 = "0";
				pmc.prop11 = pmc.eVar29 = "cqs";
				pmc.event33 = "event33";
				pmc.event35 = "event35";
				pmc.prop22 = pmc.eVar51 = "cqs";
				pmc.eVar9 = "search:cqs search";
			}
		} 
};

pmc.newOrderItem = function() {
	function pmc_orderItem() {
		this.description = "";
		this.itemNumber = "";
		this.shippingOptions = "";
		this.quantity = "";
		this.price = "";
		this.itemTotal = "";
		this.purchaseIncrementorEvents = new Array();
		this.purchaseMerchandisingEvars = new Array();
	};

	return new pmc_orderItem();
};

pmc.newOrder = function() {
	function pmc_order() {
		this.number = "";
		this.orderItems = new Array();
		this.state = "";
		this.zip = "";
		this.eVar7 = "";
		this.eVar8 = "";
		this.eVar5 = "";
		this.eVar6 = "";
		this.eVar34 = "";
		this.eVar43 = "";
		this.event7 = "";
		this.event8 = "";
		this.event9 = "";
		this.event10 = "";
		this.event14 = "";
		this.event15 = "";
		this.event38 = "";
		this.productString = "";
	};

	return new pmc_order;
};

pmc.trackOrderPurchase = function(order) {
	utag.link({
		pmc_purchase : "purchase",
		pmc_products : order.productString,
		pmc_purchaseID : order.number,
		pmc_state : order.state,
		pmc_zip : order.zip,
		pmc_eVar7 : order.eVar7,
		pmc_eVar8 : order.eVar8,
		pmc_eVar5 : order.eVar5,
		pmc_eVar6 : order.eVar6,
		pmc_eVar34 : order.eVar34,
		pmc_eVar43 : order.eVar43,
		pmc_event53 : "event53",
		pmc_event7 : order.event7,
		pmc_event8 : order.event8,
		pmc_event9 : order.event9,
		pmc_event10 : order.event10,
		pmc_event13 : order.event13,
		pmc_event14 : order.event14,
		pmc_event15 : order.event15,
		pmc_event36 : order.event36,
		pmc_event38 : order.event38,
		pmc_eVar4 : pmc.eVar4,
		pmc_eVar18 : utag_data["pmc_eVar18"],
		pmc_prop18 : utag_data["pmc_prop18"]
	});
};

pmc.setDebugMode = function() {
	this.debug = false;
	try {
		if (window.location.href.indexOf("debug=") > -1) {
			if (window.location.href.split("debug=")[1].split("&")[0] === "true") {
				this.debug = true;
			}
		}
	} catch (error) {
		;
	}
};

pmc.debugStatus = function(msg) {

	if (this.debug == true) {
		if (msg) {
			console.log("pmc.debugStatus: " + msg);
		}

		console.log(this);
	}
};

pmc.emailSignUp = function(a, b, c) {
	pmc.eVar41 = pmc.eVar42 = pmc.prop6 = pmc.prop7 = "";  // clear in case values exist.
	if(typeof(c.page.attributes.cmPageId) !== "undefined") {
		pmc.eVar41 = c.page.attributes.cmPageId;
		pmc.prop6 = "D=v41";
	}
	if(typeof(c.page.attributes.cmCategoryId) !== "undefined") {
		pmc.eVar42 = c.page.attributes.cmCategoryId.split("||NOFACET")[0];
		if(pmc.eVar42 != "") {
			pmc.prop7 = "D=v42";
		}
	}

	utag_data["pmc_eVar43"] = ""; // clear in case page view variable is left over.
	if(typeof(c.page.attributes.emailAddress) != "undefined") {
		utag_data["pmc_eVar43"] = c.page.attributes.emailAddress;
	}
	utag.view({
		pmc_event32 : "event32",
		pmc_event53 : "event53",
		pmc_eVar43 : utag_data["pmc_eVar43"],
		pmc_pageName : "customer-service:email-signup-overlay",
		pmc_prop1 : "customer-service",
		pmc_prop2 : "customer-service",
		pmc_prop3 : "customer-service",
		pmc_prop4 : "customer-service",
		pmc_prop5 : "customer-service",
		pmc_prop6 : pmc.prop6,
		pmc_prop7 : pmc.prop7,
		pmc_eVar18 : utag_data["pmc_eVar18"],
		pmc_eVar41 : pmc.eVar41,
		pmc_eVar42 : pmc.eVar42,
		pmc_prop18 : utag_data["pmc_prop18"]
	});
};



pmc.registryAdd = function(a, b, c) {

	if (b.data.items && b.data.items.item) {
		var items = new Array();

		for (var i = 0; i < b.data.items.item.length; i++) {
			var item = pmc.newOrderItem();

			item.itemNumber = b.data.items.item[i].sku;
			item.description = pmc.removeHTML(b.data.items.item[i].groupId);

			item.purchaseMerchandisingEvars.push({
				"evarName" : "eVar33",
				"value" : item.itemNumber
			});

			items.push(item);
		}

		utag.link({
			pmc_event16 : "event16",
			pmc_eVar34 : b.data.registry.registryId,
			pmc_products : pmc.getProductString(items),
			pmc_pageName : "add item:add to registry",
			pmc_prop1 : "add to registry",
			pmc_prop2 : "add item",
			pmc_prop3 : "add item",
			pmc_prop4 : "add item",
			pmc_prop5 : "add item",
			pmc_eVar18 : utag_data["pmc_eVar18"],
			pmc_prop18 : utag_data["pmc_prop18"]
		});
	}
};

pmc.wishlistAdd = function(a, b, c) {

	if (b.data.items && b.data.items.item) {
		var items = new Array();

		for (var i = 0; i < b.data.items.item.length; i++) {
			var item = pmc.newOrderItem();

			item.itemNumber = b.data.items.item[i].sku;
			item.description = pmc.removeHTML(b.data.items.item[i].groupId);

			item.purchaseMerchandisingEvars.push({
				"evarName" : "eVar33",
				"value" : item.itemNumber
			});

			items.push(item);
		}

		utag.link({
			pmc_event16 : "event16",
			pmc_eVar35 : b.data.wishlist.id,
			pmc_products : pmc.getProductString(items),
			pmc_eVar18 : utag_data["pmc_eVar18"],
			pmc_prop18 : utag_data["pmc_prop18"]
		});
	}
};

pmc.getBackorderedProductString = function() {
	pmc.backorder = pmc.newOrder();				
		if (typeof (digitalData.component) != "undefined") {
			var componentLength = digitalData.component.length;
			for (var j = 0; j < componentLength; j++) {
				if (typeof (digitalData.component[j].componentID) != "undefined") {
					if ( typeof (digitalData.component[j].componentID.componentID) != "undefined") {
						if (typeof (digitalData.component[j].attributes.groupId) != "undefined"
							&& (digitalData.component[j].componentID.componentID.match(/backorder/i) != null || digitalData.component[j].componentID.componentID.match(/view availability/i) != null) 
							&& typeof (digitalData.component[j].attributes) != "undefined") {
					
							var orderItem = pmc.newOrderItem();
							var d2 = new Date(digitalData.component[j].attributes.backorder);
							var d1 = new Date();
							var timeDiff = Math.abs(d2.getTime() - d1.getTime());
							var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
	
							utag_data["pmc_event56"] = "event56";
							
							orderItem.description = digitalData.component[j].attributes.groupId;
							orderItem.itemNumber = digitalData.component[j].attributes.sku;
	
							orderItem.purchaseIncrementorEvents.push({
								"eventName" : "event56",
								"value" : 1
							});
							orderItem.purchaseMerchandisingEvars.push({
								"evarName" : "eVar45",
								"value" : "backordered"
							});
							orderItem.purchaseMerchandisingEvars.push({
								"evarName" : "eVar46",
								"value" : diffDays
							});
							orderItem.purchaseMerchandisingEvars.push({
								"evarName" : "eVar33",
								"value" : digitalData.component[j].attributes.sku
							});
							
							pmc.backorder.orderItems.push(orderItem);
						}
					}
				}
			}
		}


	if (pmc.backorder.orderItems.length > 0) {
		return pmc.getProductString(pmc.backorder.orderItems);
	} else {
		return "";
	}
}

pmc.pageViewInternationalCheckout = function() {
	if (digitalData.x_transaction) {
		if (digitalData.x_transaction.orders) {
			utag_data["pmc_event58"] = "event58";
			pmc.purchase();
		}
	}

};

	pmc.getPageName = function() {
		//if (typeof digitalData.page.pageCategory.categories != "undefined" && digitalData.page.pageCategory.categories.length > 0 ) {
		var _pname = [];
		var _ptype = "";
		var _siteSection = "";
		var _superCategory = "";
		var _category = "";
		var _subCategory = "";
		var _eVar1 = "";
		var _eVar2 = "";
		var _eVar3 = "";
		
		if(typeof digitalData.page.pageCategory != "undefined") {
			if (digitalData.page.pageCategory.primaryCategory == "registry") {
				if (window.location.pathname.match(/\/shoppingcart/) != null) {
					utag_data["pmc_eVar34"] = window.location.pathname.match(/\/shoppingcart\/[A-Za-z0-9]+\//).toString().replace(/\/shoppingcart\//g, "").replace(/\//g, "");
				} else if (window.location.pathname.match(/\/registry\/[A-Za-z0-9]+\//) != null){
					utag_data["pmc_eVar34"] = window.location.pathname.match(/\/registry\/[A-Za-z0-9]+\//).toString().replace(/\/registry\//g, "").replace(/\//g, "");
				}
			}
			
			if (digitalData.page.pageCategory.primaryCategory == "wishlist") {
				if (window.location.pathname.match(/\/wishlist\/[A-Za-z0-9]+\//) != null) {
					utag_data["pmc_eVar35"] = window.location.pathname.match(/\/wishlist\/[A-Za-z0-9]+\//).toString().replace(/\/wishlist\//g, "").replace(/\//g, "");
				}
			}
		}
		
		for (var i = 1; typeof utag_data["_pathname" + i.toString()] != "undefined"; i++) {
			if (utag_data["_pathname" + i.toString()].toLowerCase() != "m" 
				&& utag_data["_pathname" + i.toString()] != "" 
				&& utag_data["_pathname" + i.toString()].split(".").length < 2 
				&& utag_data["_pathname" + i.toString()] != utag_data["pmc_eVar34"]
				&& utag_data["_pathname" + i.toString()] != utag_data["pmc_eVar35"]) {
				_pname.push(utag_data["_pathname" + i.toString()]);
			}
		}
		
		if(typeof digitalData.page.pageCategory != "undefined") {
			if (digitalData.page.pageCategory.primaryCategory == "shop") {
				if ( typeof window.location.hostname.match(/potterybarnkids.com/i) != "undefined" && window.location.hostname.match(/potterybarnkids.com/i) != null && window.location.hostname.match(/potterybarnkids.com/i).length > 0) {
					if ( typeof _pname[1] != "undefined" && (_pname[1] == "baby" || _pname[1] == "kids")) {
						;
					} else {
						_pname.splice(1, 0, "all");
					}
				}
			}
		}
		
		if ( typeof _pname[1] != "undefined") {
			var _ptype = "supercategory";
			_siteSection = _pname[0];
			_superCategory = _category = _subCategory = _pname[0] + ":" + _pname[1];
			_eVar1 = _eVar2 = _eVar3 = _pname[1];
		} else {
			if(typeof digitalData.page.pageCategory != "undefined") {
				var _ptype = digitalData.page.pageCategory.primaryCategory.toLowerCase();
			}
			_siteSection = _superCategory = _category = _subCategory = _pname[0];
		}

		if (_pname.length >= 3) {
			_ptype = "category";
			_siteSection = _pname[0];
			_superCategory = _pname[0] + ":" + _pname[1];
			_category = _subCategory = _pname[0] + ":" + _pname[1] + ":" + _pname[2];
			_eVar2 = _eVar3 = _pname[1] + ":" + _pname[2];
		}
		if (_pname.length >= 4) {
			_ptype = "subcategory";
			_siteSection = _pname[0];
			_superCategory = _pname[0] + ":" + _pname[1];
			_category = _pname[0] + ":" + _pname[1] + ":" + _pname[2];
			_subCategory = _pname[0] + ":" + _pname[1] + ":" + _pname[2] + ":" + _pname[3];
			_eVar2 = _pname[1] + ":" + _pname[2];
			_eVar3 = _pname[1] + ":" + _pname[2] + ":" + _pname[3];
		}
		if(typeof digitalData.page.pageCategory != "undefined") {
			if (digitalData.page.pageCategory.primaryCategory == "shop") {
				utag_data["pmc_prop1"] = pmc.removeHTML(_ptype).toLowerCase();
			} else {
				if(typeof digitalData.page.pageCategory.primaryCategory != "undefined") {
					utag_data["pmc_prop1"] = digitalData.page.pageCategory.primaryCategory.toLowerCase();
				}
			}
		}

		utag_data["pmc_prop2"] = pmc.removeHTML(_siteSection).toLowerCase();
		utag_data["pmc_prop3"] = pmc.removeHTML(_superCategory).toLowerCase();
		utag_data["pmc_prop4"] = pmc.removeHTML(_category).toLowerCase();
		utag_data["pmc_prop5"] = pmc.removeHTML(_subCategory).toLowerCase();

		if(typeof digitalData.page.pageCategory != "undefined") {
			if (digitalData.page.pageCategory.primaryCategory == "shop" || digitalData.page.pageCategory.primaryCategory == "room") {
				utag_data["pmc_eVar1"] = pmc.removeHTML(_eVar1).toLowerCase();
				utag_data["pmc_eVar2"] = pmc.removeHTML(_eVar2).toLowerCase();
				utag_data["pmc_eVar3"] = pmc.removeHTML(_eVar3).toLowerCase();
			} else {
				utag_data["pmc_eVar1"] = "";
				utag_data["pmc_eVar2"] = "";
				utag_data["pmc_eVar3"] = "";
			}
		}
		
		_pname = [];
		for (var i = 1; typeof utag_data["_pathname" + i.toString()] != "undefined"; i++) {
			if (utag_data["_pathname" + i.toString()].toLowerCase() != "m" 
				&& utag_data["_pathname" + i.toString()] != "" 
				&& utag_data["_pathname" + i.toString()] != utag_data["pmc_eVar34"]
				&& utag_data["_pathname" + i.toString()] != utag_data["pmc_eVar35"]) {
				_pname.push(utag_data["_pathname" + i.toString()].split(".")[0]);
			}
		}
		if(typeof digitalData.page.pageCategory != "undefined") {
			if ((digitalData.page.pageCategory.primaryCategory == "recipe") && (utag_data["pmc_prop1"] == "pages" || utag_data["pmc_prop2"] == "pages")) {
				utag_data["pmc_prop1"] = utag_data["pmc_prop2"] = utag_data["pmc_prop3"] = utag_data["pmc_prop4"] = utag_data["pmc_prop5"] = "recipe";
			}
			
			if (digitalData.page.pageCategory.primaryCategory == "registry") {
				if (pmc.removeHTML(_pname.join(":")).toLowerCase().match("registry-list") != null || pmc.removeHTML(_pname.join(":")).toLowerCase().match("completion-list") != null) {
					utag_data["pmc_event45"] = "event45";
					utag_data["pmc_eVar9"] = "registry";
					if (digitalData.x_state.giftGiver == true) {
						utag_data["pmc_eVar9"] = "registry:registry list gift giver";
					}
					if (digitalData.x_state.registrant == true) {
						utag_data["pmc_eVar9"] = "registry:registry list registrant";
					}
					if (digitalData.x_state.completionUser == true) {
						utag_data["pmc_eVar9"] = "registry:completion program registrant";
					} 
				}
				
				if (pmc.removeHTML(_pname.join(":")).toLowerCase().match("registry-list") != null) {
					utag_data["pmc_prop1"] = "registry list"; 
				}
				
				if (pmc.removeHTML(_pname.join(":")).toLowerCase().match("create-registry-confirmation") != null || pmc.removeHTML(_pname.join(":")).toLowerCase().match("congratulations-create") != null) {
					utag_data["pmc_event44"] = "event44"; 
				}
				
				if (pmc.removeHTML(_pname.join(":")).toLowerCase().match("registry-confirmation") != null) {
					utag_data["pmc_prop1"] = "add to registry";
					utag_data["pmc_prop2"] = utag_data["pmc_prop3"] = utag_data["pmc_prop4"] = utag_data["pmc_prop5"] = "add item";
					return ("add item:add to registry");
				}
				
				if (pmc.removeHTML(_pname.join(":")).toLowerCase() == "shoppingcart:confirmation") {
					utag_data["pmc_prop1"] = "add to cart";
					utag_data["pmc_prop2"] = utag_data["pmc_prop3"] = utag_data["pmc_prop4"] = utag_data["pmc_prop5"] = "add item";
					return ("add item:add to cart");
				}
			}
		}
		
		return pmc.removeHTML(_pname.join(":")).toLowerCase();
		// } else {
		//      try {
		//       if (utag_data["pmc_prop18"] == "mobile site") {
		//          utag_data["pmc_prop1"] = utag_data["pmc_prop2"] = utag_data["pmc_prop3"] = utag_data["pmc_prop4"] = utag_data["pmc_prop5"] = digitalData.page.pageType;
		//						return digitalData.page.pageName.toLowerCase();
		//					}
		//				} catch(e) {
		//					;
		//				}
		//}
		//return "unknown";
	};

pmc.cartAdd = function(a, b, c) {
	//console.log(b.data.items && b.data.items.item);
	//console.log(b.data.items);
	//console.log(b.data.items.item);
	//console.log(b.data.items.item.length);
	if (b.data.items && b.data.items.item) {
		var items = new Array();
		//console.log(b.data.items.item.length);
		for (var i = 0; i < b.data.items.item.length; i++) {
			var item = pmc.newOrderItem();

			//b.items.item[i].catalog
			item.itemNumber = b.data.items.item[i].sku;
			//item.price = b.data.items.item[i].price;
			//item.quantity = b.data.items.item[i].quantity;
			item.purchaseIncrementorEvents.push({
				"eventName" : "event11",
				"value" : b.data.items.item[i].quantity
			});
			item.purchaseIncrementorEvents.push({
				"eventName" : "event69",
				"value" : b.data.items.item[i].quantity
			});
			item.description = pmc.removeHTML(b.data.items.item[i].groupId);
			//b.items.item[i].membership
			item.itemTotal = (parseInt(b.data.items.item[i].quantity) * pmc.roundValue(b.data.items.item[i].price, 2));
			item.purchaseIncrementorEvents.push({
				"eventName" : "event12",
				"value" : pmc.roundValue(item.itemTotal, 2)
			});
			item.purchaseIncrementorEvents.push({
				"eventName" : "event70",
				"value" : pmc.roundValue(item.itemTotal, 2)
			});
			item.purchaseMerchandisingEvars.push({
				"evarName" : "eVar33",
				"value" : item.itemNumber
			});

			items.push(item);
			
			var pmc_monogrammed = false;  
			if(b.data.items.item[i].monogram != undefined) {
				if(b.data.items.item[i].monogram.monogramSeq != undefined) {
					for (var j = 0; j < b.data.items.item[i].monogram.monogramSeq.length; j++) {
						if(b.data.items.item[i].monogram.monogramSeq[j].monogramDetails != "No") {
							pmc_monogrammed = true;  
						}
					}
				}
			}
		}

		//console.log(items);
		//console.log(pmc_monogrammed);

		if (a.x_cart) {
			if (a.x_cart.attributes.itemCount == 0 || b.data.items.item.length == c.x_cart.attributes.itemCount) {
				if(pmc_monogrammed == false) {
					utag.link({
						pmc_scAdd : "scAdd",
						pmc_event11 : "event11",
						pmc_event12 : "event12",
						pmc_event69 : "event69",
						pmc_event70 : "event70",
						pmc_scOpen : "scOpen",
						pmc_products : pmc.getProductString(items),
						pmc_eVar18 : utag_data["pmc_eVar18"],
						pmc_prop18 : utag_data["pmc_prop18"]
					});
				} else {
					utag.link({
						pmc_event50 : "event50",
						pmc_scAdd : "scAdd",
						pmc_event11 : "event11",
						pmc_event12 : "event12",
						pmc_event69 : "event69",
						pmc_event70 : "event70",
						pmc_scOpen : "scOpen",
						pmc_products : pmc.getProductString(items),
						pmc_eVar18 : utag_data["pmc_eVar18"],
						pmc_prop18 : utag_data["pmc_prop18"]
					});
				}
			} else {
				if(pmc_monogrammed == false) {
					utag.link({
						pmc_scAdd : "scAdd",
						pmc_event11 : "event11",
						pmc_event12 : "event12",
						pmc_event69 : "event69",
						pmc_event70 : "event70",
						pmc_products : pmc.getProductString(items),
						pmc_eVar18 : utag_data["pmc_eVar18"],
						pmc_prop18 : utag_data["pmc_prop18"]
					});
				} else {
					utag.link({
						pmc_event50 : "event50",
						pmc_scAdd : "scAdd",
						pmc_event11 : "event11",
						pmc_event12 : "event12",
						pmc_event69 : "event69",
						pmc_event70 : "event70",
						pmc_products : pmc.getProductString(items),
						pmc_eVar18 : utag_data["pmc_eVar18"],
						pmc_prop18 : utag_data["pmc_prop18"]
					});
				}
			}
		} else {
			if(pmc_monogrammed == false) {
				utag.link({
					pmc_scAdd : "scAdd",
					pmc_event11 : "event11",
					pmc_event12 : "event12",
					pmc_event69 : "event69",
					pmc_event70 : "event70",
					pmc_products : pmc.getProductString(items),
					pmc_eVar18 : utag_data["pmc_eVar18"],
					pmc_prop18 : utag_data["pmc_prop18"]
				});
			} else {
				utag.link({
					pmc_scAdd : "scAdd",
					pmc_event11 : "event11",
					pmc_event12 : "event12",
					pmc_event69 : "event69",
					pmc_event70 : "event70",
					pmc_products : pmc.getProductString(items),
					pmc_eVar18 : utag_data["pmc_eVar18"],
					pmc_prop18 : utag_data["pmc_prop18"]
				});
			}
		}
	}
};
 
pmc.cartEvent = function(a, b, c) {
	if (b.data.item) {
		switch (b.data.item) {
			case "updateCartAmount":
				if(b.data.quantity < b.data.updatedQuantity) {
					// cart add
					var items = new Array();
					var item = pmc.newOrderItem();
				
					item.itemNumber = b.data.SKU
						
					item.purchaseIncrementorEvents.push({
						"eventName" : "event11",
						"value" : (b.data.updatedQuantity - b.data.quantity)
					});
					
					item.description = pmc.removeHTML(b.data.groupId);
						 
					item.itemTotal = (parseInt(b.data.updatedQuantity - b.data.quantity) * pmc.roundValue((b.data.unitPrice + b.data.unitSurcharge), 2));
					
					item.purchaseIncrementorEvents.push({
						"eventName" : "event12",
						"value" : pmc.roundValue(item.itemTotal, 2)
					});
					
					item.purchaseMerchandisingEvars.push({
						"evarName" : "eVar33",
						"value" : item.itemNumber
					});
			
					items.push(item);
				}
				if(b.data.updatedQuantity == 0 || (b.data.quantity > b.data.updatedQuantity)) {
					// cart removal
					var items = new Array();
					var item = pmc.newOrderItem();
				
					item.itemNumber = b.data.SKU
					item.description = pmc.removeHTML(b.data.groupId);
					
					item.purchaseMerchandisingEvars.push({
						"evarName" : "eVar33",
						"value" : item.itemNumber
					});
			
					items.push(item);
				}
				break;
			case "addFromSaveForLater":
				break;
			case "removeFromSaveForLater":
				break;
			case "saveForLater":
				break;
			case "removeFromCart":
				break;
			default:
				;
		}
	}
};

pmc.pageView = function() {

	// debug mode
	this.setDebugMode();
	this.debugStatus("BEGIN pageView()");
	//console.log(digitalData);
	if ( typeof digitalData != "undefined") {

		pmc.urlVariables = pmc.searchToJSON();

		if (digitalData.page && digitalData.page.attributes != undefined) {

			if ( typeof digitalData.page.attributes.cmPageId != "undefined") {
				pmc.eVar41 = digitalData.page.attributes.cmPageId;
				pmc.prop6 = "D=v41";

			}
			if ( typeof digitalData.page.attributes.cmCategoryId != "undefined") {
				pmc.eVar42 = digitalData.page.attributes.cmCategoryId.split("||NOFACET")[0];
				if (pmc.eVar42 != "") {
					pmc.prop7 = "D=v42";
				}
			}

			if (digitalData.page.attributes.mobile == true) {
				utag_data["pmc_prop18"] = utag_data["pmc_eVar18"] = "mobile site";
			}

			if (digitalData.page.attributes.accountCreated == "true" || digitalData.page.attributes.accountCreated == true) {
				pmc.event52 = "event52";
				pmc.eVar48 = "authenticated";
				if (digitalData.x_user) {
					if (digitalData.x_user.profile != undefined) {
						if (digitalData.x_user.profile.profileEmail != undefined) {
							utag_data["pmc_eVar43"] = digitalData.x_user.profile.profileEmail;
							utag_data["pmc_event53"] = "event53";
						}
					}
				}
			}

			if (document.location.pathname.match("/checkout/thanks.html") != null && digitalData.x_transaction != null) {
				utag_data["pmc_pageName"] = "checkout:order confirmation"
				pmc.channel = utag_data["pmc_prop1"] = utag_data["pmc_prop2"] = utag_data["pmc_prop3"] = utag_data["pmc_prop4"] = utag_data["pmc_prop5"] = "checkout";
				pmc.purchase();
				return;
			}

			try {
				if (digitalData.page && digitalData.page.pageCategory != undefined) {
					if (digitalData.page.pageCategory.primaryCategory == "products") {
						pmc.pageType = "product detail";
						pmc.pageViewProductDetailsPage();
						return;
					} else if (digitalData.page.pageCategory.primaryCategory == "internationalcheckout") {
						pmc.pageViewInternationalCheckout();
						return;
					} else {
						try {
							utag_data["pmc_pageName"] = pmc.getPageName();
						} catch(e) {
							utag_data["pmc_pageName"] = "unknown";
						}
					}
				}
			} catch (e) {
				;
			}
		}
	}
}; 


pmc.quickLook = function(a, b, c) {
	var groupID = c.product.productID.prodID;
	utag.view({
		pmc_event41 : "event41",
		pmc_prodView : "prodView",
		pmc_products : ";" + groupID,
		pmc_pageName : "product detail:" + groupID,
		pmc_prop1 : "product detail: quick look",
		pmc_prop2 : "product detail",
		pmc_prop3 : "product detail",
		pmc_prop4 : "product detail",
		pmc_prop5 : "product detail",
		pmc_eVar9 : "",
		pmc_prop7 : "D=v42",
		pmc_eVar42 : c.page.attributes.cmCategoryId,
		pmc_prop6 : "D=v41",
		pmc_eVar41 : c.page.attributes.cmPageId,
		pmc_eVar18 : utag_data["pmc_eVar18"],
		pmc_prop18 : utag_data["pmc_prop18"]
	});
};

pmc.quickBuy = function(a, b, c) {
	var groupID = c.product.productID.prodID;
	utag.view({
		pmc_event42 : "event42",
		pmc_prodView : "prodView",
		pmc_products : ";" + groupID,
		pmc_pageName : "product detail:" + groupID,
		pmc_prop1 : "product detail: quick buy",
		pmc_prop2 : "product detail",
		pmc_prop3 : "product detail",
		pmc_prop4 : "product detail",
		pmc_prop5 : "product detail",
		pmc_eVar9 : "",
		pmc_prop7 : "D=v42",
		pmc_eVar42 : c.page.attributes.cmCategoryId,
		pmc_prop6 : "D=v41",
		pmc_eVar41 : c.page.attributes.cmPageId,
		pmc_eVar18 : utag_data["pmc_eVar18"],
		pmc_prop18 : utag_data["pmc_prop18"]
		
	});
};

pmc.personalizationStartCallback = function(a, b, c) {
	var groupID = c.product.productID.prodID;
	utag.view({
		pmc_event49 : "event49",
		pmc_products : ";" + groupID,
		pmc_prop7 : "D=v42",
		pmc_eVar42 : c.page.attributes.cmCategoryId,
		pmc_prop6 : "D=v41",
		pmc_eVar41 : c.page.attributes.cmPageId,
		pmc_prop1 : "product: monogram options",
		pmc_prop2 : "product",
		pmc_prop3 : "product",
		pmc_prop4 : "product",
		pmc_prop5 : "product",
		pmc_pageName : "product: monogram preview overlay",
		pmc_eVar18 : utag_data["pmc_eVar18"],
		pmc_prop18 : utag_data["pmc_prop18"]
	});
};


pmc.altImageClick = function(a, b, c) {
		var groupID = c.product.productID.prodID;
		if (groupID) {
			if (b.data.item) {
				utag.link({
					pmc_event47 : "event47",
					pmc_prop14 : pmc.removeHTML(b.data.category + ":" + b.data.item),
					pmc_eVar21 : pmc.removeHTML(b.data.category + ":" + b.data.item),
					link_text : "element interaction",
					pmc_products : ";" + c.product.productID.prodID,
					pmc_prop19 : "",
					pmc_eVar31 : b.data.item.toLowerCase(),
					pmc_event39 : "event39",
					pmc_products : ";" + groupID + ";;;event39=1",
					pmc_prop19 : "",
					pmc_eVar18 : utag_data["pmc_eVar18"],
					pmc_prop18 : utag_data["pmc_prop18"]
				});
			} else if (b.data.name) {
				utag.link({
					pmc_event47 : "event47",
					pmc_prop14 : pmc.removeHTML(b.data.category + ":" + b.data.name),
					pmc_eVar21 : pmc.removeHTML(b.data.category + ":" + b.data.name),
					link_text : "element interaction",
					pmc_products : ";" + c.product.productID.prodID,
					pmc_prop19 : "",
					pmc_eVar31 : b.data.name.toLowerCase(),
					pmc_event39 : "event39",
					pmc_products : ";" + groupID + ";;;event39=1",
					pmc_prop19 : "",
					pmc_eVar18 : utag_data["pmc_eVar18"],
					pmc_prop18 : utag_data["pmc_prop18"]
				});
			}
		}
}; 

pmc.overlayPageView = function(a, b, c, overlayName, prop1) {
	if(typeof prop1 != "undefined") {
		utag.view({
			pmc_pageName : overlayName,
			pmc_prop1 : prop1,
			pmc_prop2 : c.page.pageCategory.primaryCategory,
			pmc_prop3 : c.page.pageCategory.primaryCategory,
			pmc_prop4 : c.page.pageCategory.primaryCategory,
			pmc_prop5 : c.page.pageCategory.primaryCategory,
			pmc_event50 : "",
			pmc_event47 : "",
			pmc_prop14 : "",
			pmc_eVar21 : "",
			pmc_prop7 : "D=v42",
			pmc_eVar42 : c.page.attributes.cmCategoryId,
			pmc_prop6 : "D=v41",
			pmc_eVar41 : c.page.attributes.cmPageId,
			pmc_products : "",
			pmc_event42 : null,
			pmc_event41 : null,
			pmc_eVar18 : utag_data["pmc_eVar18"],
			pmc_prop18 : utag_data["pmc_prop18"]
		});
	} else {
		utag.view({
			pmc_pageName : overlayName,
			pmc_prop1 : c.page.pageCategory.primaryCategory,
			pmc_prop2 : c.page.pageCategory.primaryCategory,
			pmc_prop3 : c.page.pageCategory.primaryCategory,
			pmc_prop4 : c.page.pageCategory.primaryCategory,
			pmc_prop5 : c.page.pageCategory.primaryCategory,
			pmc_event50 : "",
			pmc_event47 : "",
			pmc_prop14 : "",
			pmc_eVar21 : "",
			pmc_prop7 : "D=v42",
			pmc_eVar42 : c.page.attributes.cmCategoryId,
			pmc_prop6 : "D=v41",
			pmc_eVar41 : c.page.attributes.cmPageId,
			pmc_products : "",
			pmc_event42 : null,
			pmc_event41 : null,
			pmc_eVar18 : utag_data["pmc_eVar18"],
			pmc_prop18 : utag_data["pmc_prop18"]
		});
	} 
};	

pmc.registerCallbacks = function() {

	WSI.dataLayer.registerCallback(function(a, b, c) {
		console.log("Callback: ", a, b, c);
		if(typeof(s) != 'undefined' && typeof(s) == 'object') {
			if (s.events) {
				//console.log("s.events " + s.events);
				s.events = "";
			}
		}
		if (b.name != undefined) {
			//console.log(b.name);
			//console.log(b.target);
			//console.log(b.data.category);
			//console.log(b.data.item);
			 
			if (b.name == "addToCart") {
				pmc.cartAdd(a, b, c);
			}
			if (b.name == "addToRegistry") {
				pmc.registryAdd(a, b, c);
			}
			if (b.name == "addToWishlist") {
				pmc.wishlistAdd(a, b, c);
			}
			if (b.name == "addChild" && (b.target == "CUSTOMER SERVICE:EMAIL SIGNUP OVERLAY")) {
				pmc.emailSignUp(a, b, c);
			}
			if (b.name == "addChild" && (b.target == "CUSTOMER SERVICE:EMAIL SIGNUP THANKYOU OVERLAY")) {
				utag.view({
					pmc_pageName : "customer-service:email-signup-thankyou-overlay",
					pmc_prop1 : "customer-service",
					pmc_prop2 : "customer-service",
					pmc_prop3 : "customer-service",
					pmc_prop4 : "customer-service",
					pmc_prop5 : "customer-service",
					pmc_prop6 : "D=v41",
					pmc_prop7 : "D=v42",
					pmc_eVar18 : utag_data["pmc_eVar18"],
					pmc_eVar41 : c.page.attributes.cmPageId,
					pmc_eVar42 : c.page.attributes.cmCategoryId,
					pmc_prop18 : utag_data["pmc_prop18"]
				});
			}
			if (b.name == "cartEvent") {
				pmc.cartEvent(a, b, c);
			}
			if (b.name == "addChild" && b.target == "QuickLook_Overlay") {
				pmc.quickLook(a, b, c);
			}
			if (b.name == "addChild" && b.target == "QuickBuy_Overlay") {
				pmc.quickBuy(a, b, c);
			}
			if (b.name == "addChild" && b.target == "REGISTRY CONFIRMATION-RICH") {
				utag.view({
					pmc_pageName : "add item:add to registry",
					pmc_prop1 : "add to registry",
					pmc_prop2 : "add item",
					pmc_prop3 : "add item",
					pmc_prop4 : "add item",
					pmc_prop5 : "add item",
					pmc_prop7 : "D=v42",
					pmc_eVar42 : c.page.attributes.cmCategoryId,
					pmc_prop6 : "D=v41",
					pmc_eVar41 : c.page.attributes.cmPageId,
					pmc_products : "",
					pmc_event42 : null,
					pmc_event41 : null,
					pmc_eVar18 : utag_data["pmc_eVar18"],
					pmc_prop18 : utag_data["pmc_prop18"]
				});
			}
			if (b.name == "addChild" && b.target == "WISHLIST: ITEM ADDED") {
				utag.view({
					pmc_pageName : "add item:add to wish list",
					pmc_prop1 : "add to wishlist",
					pmc_prop2 : "add item",
					pmc_prop3 : "add item",
					pmc_prop4 : "add item",
					pmc_prop5 : "add item",
					pmc_event50 : "",
					pmc_event47 : "",
					pmc_prop14 : "",
					pmc_eVar21 : "",
					pmc_prop7 : "D=v42",
					pmc_eVar42 : c.page.attributes.cmCategoryId,
					pmc_prop6 : "D=v41",
					pmc_eVar41 : c.page.attributes.cmPageId,
					pmc_products : "",
					pmc_event42 : null,
					pmc_event41 : null,
					pmc_eVar18 : utag_data["pmc_eVar18"],
					pmc_prop18 : utag_data["pmc_prop18"]

				});
			}
			if (b.name == "addChild" && b.target == "ECOMMERCE CONFIRMATION-RICH") {
				utag.view({
						pmc_pageName : "add item:add to cart",
						pmc_prop1 : "add to cart",
						pmc_prop2 : "add item",
						pmc_prop3 : "add item",
						pmc_prop4 : "add item",
						pmc_prop5 : "add item",
						pmc_event50 : "",
						pmc_event47 : "",
						pmc_prop14 : "",
						pmc_eVar21 : "",
						pmc_prop7 : "D=v42",
						pmc_eVar42 : c.page.attributes.cmCategoryId,
						pmc_prop6 : "D=v41",
						pmc_eVar41 : c.page.attributes.cmPageId,
						pmc_products : "",
						pmc_event42 : null,
						pmc_event41 : null,
						pmc_eVar18 : utag_data["pmc_eVar18"],
						pmc_prop18 : utag_data["pmc_prop18"]
					});
			}
			if (b.name == "addChild" && b.target == "MINIPIP_OVERLAY") {
				utag.view({
						pmc_pageName : "product detail:" + c.product.productID.prodID,
						pmc_prop1 : "product detail:secondary product overlay",
						pmc_prop2 : "product detail",
						pmc_prop3 : "product detail",
						pmc_prop4 : "product detail",
						pmc_prop5 : "product detail",
						pmc_event50 : "",
						pmc_event47 : "",
						pmc_prop14 : "",
						pmc_eVar21 : "",
						pmc_prop7 : "D=v42",
						pmc_eVar42 : c.page.attributes.cmCategoryId,
						pmc_prop6 : "D=v41",
						pmc_eVar41 : c.page.attributes.cmPageId,
						pmc_products : "",
						pmc_event42 : null,
						pmc_event41 : null,
						pmc_eVar18 : utag_data["pmc_eVar18"],
						pmc_prop18 : utag_data["pmc_prop18"]
					});
			}
			if (b.name == "addChild" && b.target == "POPUP: SHIPPING OPTIONS") {
				pmc.overlayPageView(a, b, c, "shipping options overlay");
			}
			if (b.name == "addChild" && b.target == "POPUP: RETURN POLICY") {
				pmc.overlayPageView(a, b, c, "return policy overlay");
			}
			if (b.name == "addChild" && b.target == "POPUP: CHECK SVC BALANCE") {
				pmc.overlayPageView(a, b, c, "svc balance overlay");
			}
			if (b.name == "addChild" && b.target == "POPUP: GIFT WRAP") {
				pmc.overlayPageView(a, b, c, "gift wrap overlay");
			}
			if (b.name == "addChild" && b.target == "ACCOUNT: ADDRESS BOOK ADD") {
				pmc.overlayPageView(a, b, c, "account:address book add", "overlay");
			}
			if (b.name == "addChild" && b.target == "ACCOUNT: ADDRESS BOOK EDIT") {
				pmc.overlayPageView(a, b, c, "account:address book edit", "overlay");
			}
			if (b.name == "addChild" && b.target == "ACCOUNT: ADDRESS BOOK REMOVE") {
				pmc.overlayPageView(a, b, c, "account:address book remove", "overlay");
			}
			if (b.name == "addChild" && b.target == "ACCOUNT: RESEND EMAIL") {
				pmc.overlayPageView(a, b, c, "account:resent email", "overlay");
			}
			if (b.name == "addChild" && b.target == "PASSWORD GUIDELINES") {
				pmc.overlayPageView(a, b, c, "account:password guidelines", "overlay");
			}
			if (b.name == "addChild" && b.target == "Monogram Preview Overlay") {
				pmc.personalizationStartCallback(a, b, c);
			}
			if (b.name == "addChild" && b.target == "monogram guide") {
				utag.view({
					pmc_pageName : b.target,
					pmc_prop1 : "popup",
					pmc_prop2 : "monogram-options",
					pmc_prop3 : "monogram-options",
					pmc_prop4 : "monogram-options",
					pmc_prop5 : "monogram-options",
					pmc_event50 : "",
					pmc_event47 : "",
					pmc_prop14 : "",
					pmc_eVar21 : "",
					pmc_prop7 : "D=v42",
					pmc_eVar42 : "OVERLAY",
					pmc_prop6 : "D=v41",
					pmc_eVar41 : "MONOGRAM GUIDE",
					pmc_products : "",
					pmc_event42 : null,
					pmc_event41 : null,
					pmc_eVar18 : utag_data["pmc_eVar18"],
					pmc_prop18 : utag_data["pmc_prop18"]
				});
				if (b.name == "addChild" && b.target == "international shipping to") {
				utag.view({
					pmc_pageName : b.target,
					pmc_prop1 : "overlay",
					pmc_prop2 : "international",
					pmc_prop3 : "international",
					pmc_prop4 : "international",
					pmc_prop5 : "international",
					pmc_event50 : "",
					pmc_event47 : "",
					pmc_prop14 : "",
					pmc_eVar21 : "",
					pmc_prop7 : "D=v42",
					pmc_eVar42 : "INTERNATIONAL",
					pmc_prop6 : "D=v41",
					pmc_eVar41 : "INTERNATIONAL: SHIPPING TO",
					pmc_products : "",
					pmc_event42 : null,
					pmc_event41 : null,
					pmc_eVar18 : utag_data["pmc_eVar18"],
					pmc_prop18 : utag_data["pmc_prop18"]
				});
			}
			
			//console.log("|||****");
			//console.log("|||****"+b.name);
			//console.log("|||****"+b.data.name);
				if (b.name == "elementInteraction" && typeof b.data.name != "undefined") {
					//console.log("****");
					
					if (b.data.name.match(/personalized content/gi) != null) {
						//console.log("****");
						if ( typeof b.data.data.programStatus != "undefined") {
							//console.log("****");
							if (b.data.data.programStatus.match(/control/gi) != null || b.data.data.programStatus.match(/test/gi) != null) {
								//console.log("****");
								if ( typeof b.data.data.productId != "undefined" && b.data.data.productId != "") {
									utag.link({
										pmc_prop72 : b.data.data.campaign.substring(0, 48) + "|" + b.data.data.placement.substring(0, 48),
										link_text : "content personalization - element interaction",
										pmc_prop19 : "",
										pmc_eVar18 : utag_data["pmc_eVar18"],
										pmc_prop18 : utag_data["pmc_prop18"],
										pmc_event72 : "event72",
										pmc_prop73 : b.data.data.productId.substring(0, 99)
									});
								} else {
									utag.link({
										pmc_prop72 : b.data.data.campaign.substring(0, 48) + "|" + b.data.data.placement.substring(0, 48),
										link_text : "content personalization - element interaction",
										pmc_prop19 : "",
										pmc_eVar18 : utag_data["pmc_eVar18"],
										pmc_prop18 : utag_data["pmc_prop18"],
										pmc_event72 : "event72"
									});
								}
							}
						}
					}
				}
			
			if (b.name == "elementInteraction" && (b.data.category == "PIP" || b.data.category == "Alt Image Interaction") && b.data.item.match(/ALT IMAGE/gi) != null) {
				pmc.altImageClick(a, b, c);
			} else if(b.name == "elementInteraction" && b.data.item.match(/ORDER SUMMARY EXPAND/gi) != null) { 
				utag.link({
					pmc_prop13 : pmc.removeHTML(b.data.category + ":" + b.data.item),
					link_text : "element interaction",
					pmc_prop19 : "",
					pmc_eVar18 : utag_data["pmc_eVar18"],
					pmc_prop18 : utag_data["pmc_prop18"]
				});
			} else if(b.name == "elementInteraction" && b.data.item.match(/MULTI-SHIP EXPAND LINE/gi) != null) { 
				utag.link({
					pmc_prop13 : pmc.removeHTML(b.data.category + ":" + b.data.item),
					link_text : "element interaction",
					pmc_prop19 : "",
					pmc_eVar18 : utag_data["pmc_eVar18"],
					pmc_prop18 : utag_data["pmc_prop18"]
				});
			} else if(b.name == "elementInteraction" && b.data.item.match(/MULTI-SHIP COLLAPSE LINE/gi) != null) { 
				utag.link({
					pmc_prop13 : pmc.removeHTML(b.data.category + ":" + b.data.item),
					link_text : "element interaction",
					pmc_prop19 : "",
					pmc_eVar18 : utag_data["pmc_eVar18"],
					pmc_prop18 : utag_data["pmc_prop18"]
				});
			} else if(b.name == "elementInteraction" && b.data.item.match(/GIFT ORDER YES/gi) != null) { 
				utag.link({
					pmc_prop13 : pmc.removeHTML(b.data.category + ":" + b.data.item),
					link_text : "element interaction",
					pmc_prop19 : "",
					pmc_eVar18 : utag_data["pmc_eVar18"],
					pmc_prop18 : utag_data["pmc_prop18"]
				});
			} else if(b.name == "elementInteraction" && b.data.item.match(/SHIPPING SAME AS BILLING/gi) != null) { 
				utag.link({
					pmc_prop13 : pmc.removeHTML(b.data.category + ":" + b.data.item),
					link_text : "element interaction",
					pmc_prop19 : "",
					pmc_eVar18 : utag_data["pmc_eVar18"],
					pmc_prop18 : utag_data["pmc_prop18"]
				});
			} else if (b.name == "elementInteraction") {
				//console.log(b.name);
				//console.log(c.product);
				//console.log(b.data.item);
				//console.log(b.data.name);
				if(c.product != undefined) {
					if(b.data.item != "ADD TO CART" && b.data.item != "UPDATE CART" && b.data.item != "ADD TO REGISTRY" & b.data.item != "UPDATE REGISTRY") {
						if(b.data.item) {
							utag.link({
								pmc_event47 : "event47",
								pmc_prop14 : pmc.removeHTML(b.data.category + ":" + b.data.item),
								pmc_eVar21 : pmc.removeHTML(b.data.category + ":" + b.data.item),
								link_text : "element interaction",
								pmc_products : ";" + c.product.productID.prodID,
								pmc_prop19 : "",
								pmc_eVar18 : utag_data["pmc_eVar18"],
								pmc_prop18 : utag_data["pmc_prop18"]
							});
						} else if(b.data.name) {
							utag.link({
								pmc_event47 : "event47",
								pmc_prop14 : pmc.removeHTML(b.data.category + ":" + b.data.name),
								pmc_eVar21 : pmc.removeHTML(b.data.category + ":" + b.data.name),
								link_text : "element interaction",
								pmc_products : ";" + c.product.productID.prodID,
								pmc_prop19 : "",
								pmc_eVar18 : utag_data["pmc_eVar18"],
								pmc_prop18 : utag_data["pmc_prop18"]
							});
						}
					}
				}
			}
			
			if (b.name == "updateLayer") {
				if(typeof b.target != "undefined") {
					//console.log(c);
					if(typeof b.data != "undefined") {
						if(typeof b.data.action != "undefined") {
							if(b.data.action == 'pagination') {
								pmc.pageView();
								utag.view({
										pmc_pageName : utag_data["pmc_pageName"],
										pmc_eVar1 : utag_data["pmc_eVar1"],
										pmc_eVar2 : utag_data["pmc_eVar2"],
										pmc_eVar3 : utag_data["pmc_eVar3"],
										pmc_eVar41 : pmc.eVar41,
										pmc_eVar42 : pmc.eVar42,
										pmc_prop1 : utag_data["pmc_prop1"],
										pmc_prop2 : utag_data["pmc_prop2"],
										pmc_prop3 : utag_data["pmc_prop3"],
										pmc_prop4 : utag_data["pmc_prop4"],
										pmc_prop5 : utag_data["pmc_prop5"],
										pmc_prop6 : pmc.prop6,
										pmc_prop7 : pmc.prop7,
										pmc_prop20 : b.data.newPage,
										pmc_eVar18 : utag_data["pmc_eVar18"],
										pmc_prop18 : utag_data["pmc_prop18"]
									});
							}
						}
					} else if(b.target.match(/category:/i) != null && typeof(c) != "undefined") {
						pmc.updateCategoryRefinements(c);
					} 
				}
			}
			
		    if (b.name == "addComponent") {
				if(typeof b.data != "undefined") {
					if(typeof b.data.data != "undefined") {
						if(typeof b.data.name != "undefined") {
							if(b.data.name.match(/backorder/gi) != null) {
								var d2 = new Date(b.data.data.backorder); 
								var d1 = new Date(); 
								var timeDiff = Math.abs(d2.getTime() - d1.getTime());
								var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
								utag.link({
									pmc_event56 : "event56",
									link_text : "backorder date viewed",
									pmc_products : ";" + b.data.data.groupId + ";;;event56=1;eVar33=" + b.data.data.sku + "|eVar46=" + diffDays,
									pmc_eVar18 : utag_data["pmc_eVar18"],
									pmc_prop18 : utag_data["pmc_prop18"]
								});
							}
						}
					}
		        }
		    }
		    if (b.name == "addComponent") {
				if(typeof b.data != "undefined") {
					if(typeof b.data.data != "undefined") {
						if(typeof b.data.name != "undefined") {
							if(b.data.name.match(/availability/gi) != null) {
								utag.link({
									pmc_event55 : "event55",
									link_text : "view availability date displayed",
									pmc_products : ";" + b.data.data.groupId + ";;;event55=1;eVar45=mixed availability",
									pmc_eVar18 : utag_data["pmc_eVar18"],
									pmc_prop18 : utag_data["pmc_prop18"]
								});
							}
						}
					}
		        }
		    }
		    if (b.name == "accountCreate") {
				if(typeof b.data !== "undefined" && 
					typeof b.data.profileEmail !== "undefined" ) {
					utag.link({
						pmc_event52 : "event52",
						pmc_event53 : "event53",
						pmc_event51 : "event51",
						pmc_eVar43  : b.data.profileEmail
					});
				}
		    }
		    if (b.name === "personalizedResponse" && b.data && 
		    		b.data.placements && b.data.placements.length > 0 ) {
	    		var placements = b.data.placements,
	    			placement,
	    			programStatus,
	    			placementDetails,
	    			count;
	    		for (count = 0; count < placements.length; count++) {
	    			placement = placements[count];
	    			programStatus = placement.programStatus;
	    			if ( programStatus !== "INELIGIBLE" ) {
	    				placementDetails =[ placement.programStatus, 
	    				                    placement.campaign.substring(0, 48), 
	    				                    placement.placement.substring(0, 49) ];
	    				if ( typeof utag_data["pmc_list1"] === "undefined" ) {
	    					utag_data["pmc_list1"] = placementDetails.join("|");
	    				} else {
	    					utag_data["pmc_list1"] = utag_data["pmc_list1"] + ";" + placementDetails.join("|");
	    				}
	    			}
	    		}
	    		utag_data["pmc_event71"] = "event71";
	    		utag_data["pmc_eVar71"] = "TEST/CONTROL";
	    	}
		}
	}, true);
};

try {
	pmc.registerCallbacks();
	pmc.pageView();
} catch(e) {
	;
}
//pmc;

