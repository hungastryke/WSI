pmc = {};
_tealium_pixel_counter = 0;
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

pmc.setRefinements = function() {
	if(digitalData.page.attributes.refinements.types) {
	    utag_data["pmc_eVar47"] = pmc.eVar47 = "search";
	    utag_data["pmc_prop16"] = pmc.prop16 = (digitalData.page.attributes.refinements.types[0]).toLowerCase();    //last type
	    utag_data["pmc_prop17"] = pmc.prop17 = (digitalData.page.attributes.refinements.types[0] + ":" + digitalData.page.attributes.refinements.values[0]).toLowerCase(); // last type:value
	    pmc.eVar39 = []; // |-delimited list of types
	    pmc.eVar40 = []; // |-delimited list of types:values
	    
	    for(var i=0; i < digitalData.page.attributes.refinements.types.length; i++) {
	        pmc.eVar39.push(digitalData.page.attributes.refinements.types[i]);
	        pmc.eVar40.push(digitalData.page.attributes.refinements.types[i] + ":" + digitalData.page.attributes.refinements.values[i]);
	    }
	    utag_data["pmc_eVar39"] = pmc.eVar39 = pmc.eVar39.join("|").toLowerCase();
	    utag_data["pmc_eVar40"] = pmc.eVar40 = pmc.eVar40.join("|").toLowerCase();
	}
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
			pmc_eVar18 : pmc.eVar18,
			pmc_prop18 : pmc.prop18
	    });
	}
};

pmc.setBasePageName = function () {
	 
	// parseUri 1.2.2
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License

	function parseUri(str) {
		var o = parseUri.options, m = o.parser[o.strictMode ? "strict" : "loose"].exec(str), uri = {}, i = 14;

		while (i--)
		uri[o.key[i]] = m[i] || "";

		uri[o.q.name] = {};
		uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) {
			if ($1)
				uri[o.q.name][$1] = $2;
		});

		return uri;
	};

	parseUri.options = {
		strictMode : false,
		key : ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
		q : {
			name : "queryKey",
			parser : /(?:^|&)([^&=]*)=?([^&]*)/g
		},
		parser : {
			strict : /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
			loose : /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
		}
	};
	
	function indexOf_(arr,val) {
					for(var i=0; i < arr.length; i++) {
						if(arr[i] === val) {
							return i; 
						}
					}
					return -1; 
				}

	function removeA(arr) {
		var what, a = arguments, L = a.length, ax;
		while (L > 1 && arr.length) {
			what = a[--L];
			while (( ax = indexOf_(arr,what)) !== -1) {
				arr.splice(ax, 1);
			}
		}
		return arr;
	}
	//console.log(parseUri(document.location.pathname));
	if (removeA(parseUri(document.location.pathname).directory.split("/"), "").length == 0) {
		pmc.pageName = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = parseUri(document.location.pathname).file.split(".")[0];
	} else {
		pmc.pageName = removeA(removeA(removeA(parseUri(document.location.pathname).directory.split("/"), ""), "/"), "m").join(":");
		if (parseUri(document.location.pathname).file != undefined) {
			if (parseUri(document.location.pathname).file.length > 0) {
				pmc.pageName = removeA(removeA(removeA(parseUri(document.location.pathname).directory.split("/"), ""), "/"), "m").join(":") + ":" + parseUri(document.location.pathname).file.split(".")[0];
			}

		}

		var pth = removeA(removeA(removeA(parseUri(document.location.pathname).directory.split("/"), ""), "/"), "m");

		pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = pth.shift();

		if (removeA(removeA(removeA(parseUri(document.location.pathname).directory.split("/"), ""), "/"), "m").length >= 2) {
			var pth_ = pth.shift();
			(pth_!=undefined) ? (pmc.prop3 = pmc.prop3 + ":" + pth_) : pmc.prop3;
			(pth_!=undefined) ? (pmc.prop4 = pmc.prop4 + ":" + pth_) : pmc.prop4;
			(pth_!=undefined) ? (pmc.prop5 = pmc.prop5 + ":" + pth_) : pmc.prop5;
		}
		if (removeA(removeA(removeA(parseUri(document.location.pathname).directory.split("/"), ""), "/"), "m").length >= 3) {
			var pth_ = pth.shift();
			(pth_!=undefined) ? (pmc.prop4 = pmc.prop4 + ":" + pth_) : pmc.prop4;
			(pth_!=undefined) ? (pmc.prop5 = pmc.prop5 + ":" + pth_) : pmc.prop5;
		}
		if (removeA(removeA(removeA(parseUri(document.location.pathname).directory.split("/"), ""), "/"), "m").length >= 3) {
			var pth_ = pth.shift();
			(pth_!=undefined) ? (pmc.prop5 = pmc.prop5 + ":" + pth_) : pmc.prop5;
		}
	}

}

pmc.cartReview = function() {
	pmc.pageName = pmc.pageType = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = "shopping cart";
	//pmc.eVar9 = "shop";
	pmc.order = pmc.newOrder();
	pmc.scView = "scView";
	
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
								/*
								pmc.event11 = "event11";
								orderItem.purchaseIncrementorEvents.push({
									"eventName" : "event11",
									"value" : item.quantity
								});
								*/
								utag_data["pmc_event69"] = "event69";
								orderItem.purchaseIncrementorEvents.push({
									"eventName" : "event69",
									"value" : item.quantity
								});
							}
													
							orderItem.itemTotal = (parseInt(item.quantity) * pmc.roundValue(item.price.unitPrice, 2));
							if(orderItem.itemTotal) {
								/*
								pmc.event12 = "event12";
								orderItem.purchaseIncrementorEvents.push({
									"eventName" : "event12",
									"value" : pmc.roundValue(orderItem.itemTotal, 2)
								});
								*/
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
		pmc.productString = pmc.getProductString(pmc.order.orderItems);
	}

	return;
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
						pmc.event53 = "event53";
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
		pmc.eVar43 = pmc.orders[0].eVar43;
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

pmc.pageViewAccountPage = function() {
	pmc.setBasePageName();
};

pmc.pageViewHomePage = function() {
	pmc.pageType = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = pmc.pageName = "home page";
	return;
};


	pmc.setSearchReturnedResultsByPageType = function() {
		if (pmc.eVar41.match(/PRODUCT SEARCH RESULTS/gi) != null) {
			pmc.prop11 = pmc.eVar29 = "product";

			if (!isNaN(digitalData.page.attributes.searchResults.product)) {
				pmc.prop10 = digitalData.page.attributes.searchResults.product;
			}
		}
		if (pmc.eVar41.match(/RECIPE SEARCH RESULTS/gi) != null) {
			pmc.prop11 = pmc.eVar29 = "recipe";

			if (!isNaN(digitalData.page.attributes.searchResults.recipe)) {
				pmc.prop10 = digitalData.page.attributes.searchResults.recipe;
			}
		}
		if (pmc.eVar41.match(/VIDEO SEARCH RESULTS/gi) != null) {
			pmc.prop11 = pmc.eVar29 = "video";

			if (!isNaN(digitalData.page.attributes.searchResults.video)) {
				pmc.prop10 = digitalData.page.attributes.searchResults.video;
			}
		}
		if (pmc.eVar41.match(/ARTICLE SEARCH RESULTS/gi) != null) {
			pmc.prop11 = pmc.eVar29 = "article";

			if (!isNaN(digitalData.page.attributes.searchResults.article)) {
				pmc.prop10 = digitalData.page.attributes.searchResults.article;
			}
		}
	};


pmc.pageViewSearchPage = function() {
	pmc.pageName = "search:results";
	pmc.prop10 = "0";
	pmc.event33 = "event33";
	pmc.eVar9 = "search:search results";
	
	if(digitalData.page.attributes.searchResultsType) {
		pmc.eVar51 = pmc.prop22 = digitalData.page.attributes.searchResultsType.toLowerCase();
		if(pmc.eVar51 === "partialmatch") {
			pmc.eVar51 = pmc.prop22 = "partial-match";
		} else if(pmc.eVar51 === "spellcorrected") {
			pmc.eVar51 = pmc.prop22 = "spell-corrected";
		} else if(pmc.eVar51 === "typeahead") {
			pmc.eVar51 = pmc.prop22 = "type-ahead";
		} else if(pmc.eVar51 === "didyoumean") {
			pmc.eVar51 = pmc.prop22 = "did-you-mean";
		}
	}

	if (digitalData.page.attributes.searchResultsType == "NULL") {
		if(digitalData.page.attributes.searchTerm != undefined) {
			pmc.prop9 = pmc.eVar27 = digitalData.page.attributes.searchTerm.toLowerCase();
		} else if (pmc.urlVariables.words != undefined && pmc.urlVariables.words != null && pmc.urlVariables.words != "") {
			pmc.prop9 = pmc.eVar27 = pmc.urlVariables.words.toLowerCase();
		}
		pmc.prop10 = "0";
		pmc.prop11 = pmc.eVar29 = "no results";
		pmc.event34 = "event34";
	} else if ((typeof digitalData.page.attributes.searchResultsNla != "undefined" && digitalData.page.attributes.searchResultsNla == true) || pmc.eVar42.indexOf("NLA") >= 0) {
		//pmc.eVar9 = 'search:nla search'; #2356.
		pmc.prop10 = "0";
		pmc.eVar29 = pmc.prop11 = "nla";    
		if(digitalData.page.attributes.searchTerm != undefined) {
			pmc.prop9 = pmc.eVar27 = digitalData.page.attributes.searchTerm.toLowerCase();
		} else if (pmc.urlVariables.words != undefined && pmc.urlVariables.words != null && pmc.urlVariables.words != "") {
			pmc.prop9 = pmc.eVar27 = pmc.urlVariables.words.toLowerCase();
		}
		pmc.event59 = "event59";
		pmc.setSearchReturnedResultsByPageType();
		return;
	} else if (digitalData.page.attributes.searchResultsType == "cqs") {
		pmc.eVar9 = 'search:cqs search';
		
		if(digitalData.page.attributes.searchTerm != undefined) {
			pmc.prop9 = pmc.eVar27 = digitalData.page.attributes.searchTerm.toLowerCase();
		} else if (pmc.urlVariables.words != undefined && pmc.urlVariables.words != null && pmc.urlVariables.words != "") {
			pmc.prop9 = pmc.eVar27 = pmc.urlVariables.words.toLowerCase();
		}
		pmc.prop10 = "0";
		return;
	} else {
		if (digitalData.page.attributes.searchTermEntered) {
			if(digitalData.page.attributes.searchTermEntered != undefined) {
				pmc.prop9 = pmc.eVar27 = digitalData.page.attributes.searchTermEntered.toLowerCase();
			}
			if (digitalData.page.attributes.searchTermEntered != digitalData.page.attributes.searchTerm) {
				pmc.setSearchReturnedResultsByPageType();
				if(digitalData.page.attributes.searchTerm != undefined) {
					pmc.prop9 = pmc.eVar27 = digitalData.page.attributes.searchTerm.toLowerCase();
				}
				if(digitalData.page.attributes.searchTermEntered != undefined) {
					pmc.prop12 = pmc.eVar28 = digitalData.page.attributes.searchTermEntered.toLowerCase();
				}
				pmc.event37 = "event37";
			} else {
				pmc.setSearchReturnedResultsByPageType();
			}
		} else {
			if(digitalData.page.attributes.searchTerm != undefined) {
				pmc.prop9 = pmc.eVar27 = digitalData.page.attributes.searchTerm.toLowerCase();
			} else if (pmc.urlVariables.words != undefined && pmc.urlVariables.words != null && pmc.urlVariables.words != "") {
				pmc.prop9 = pmc.eVar27 = pmc.urlVariables.words.toLowerCase();
			}
			pmc.setSearchReturnedResultsByPageType();
		}
	}
	/*
	if (digitalData.page.attributes.viewAll == true) {
		pmc.prop20 = "view all";
	}
	*/
	if (digitalData.page.attributes.searchResultsType == "CQSnull") {
		pmc.eVar9 = 'search:cqs search';
		pmc.prop10 = "0";
		pmc.prop11 = pmc.eVar29 = "no results";
		pmc.event34 = "event34";
	}
	
	pmc.setRefinements(); 
	 
	return;
};

pmc.pageViewStyleQuantityPage = function() {
	pmc.pageName = pmc.prop1 = "product detail:style and quantity";
	pmc.prop2 = "product detail";
	pmc.prop3 = "product detail";
	pmc.prop4 = "product detail";
	pmc.prop5 = "product detail"; 
};

pmc.pageViewProductDetailsPage = function() {
 
		if (pmc.eVar42 != "M:PIP INTERSTITIAL") {
			pmc.event18 = "event18";
			pmc.prodView = "prodView";
			if (digitalData.product != undefined && digitalData.product.productID != undefined && digitalData.product.productID.prodID != undefined) {
				pmc.pageName = "product detail:" + digitalData.product.productID.prodID;
			}

			pmc.prop1 = "product detail";
			pmc.prop2 = "product detail";
			pmc.prop3 = "product detail";
			pmc.prop4 = "product detail";
			pmc.prop5 = "product detail";

			if (digitalData.page.attributes.template == "simple") {
				pmc.prop1 = "product detail:simple pip";
			}
			if (digitalData.page.attributes.template == "complex") {
				pmc.prop1 = "product detail:complex pip";
			}
			if (digitalData.page.attributes.template == "upholstery pip") {
				pmc.prop1 = "product detail:upholstery pip";
			}
			if (digitalData.product.productID.prodID == "gift-card" || digitalData.product.productID.prodID == "gift-cards" || digitalData.product.productID.prodID == "pottery-barn-gift-cards") {
				pmc.prop1 = "product detail:" + digitalData.product.productID.prodID;
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
		pmc_eVar18 : pmc.eVar18,
		pmc_prop18 : pmc.prop18
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

	pmc.eVar43 = ""; // clear in case page view variable is left over.
	if(typeof(c.page.attributes.emailAddress) != "undefined") {
		pmc.eVar43 = c.page.attributes.emailAddress;
	}
	utag.view({
		pmc_event32 : "event32",
		pmc_event53 : "event53",
		pmc_eVar43 : pmc.eVar43,
		pmc_pageName : "customer-service:email-signup-overlay",
		pmc_prop1 : "customer-service",
		pmc_prop2 : "customer-service",
		pmc_prop3 : "customer-service",
		pmc_prop4 : "customer-service",
		pmc_prop5 : "customer-service",
		pmc_prop6 : pmc.prop6,
		pmc_prop7 : pmc.prop7,
		pmc_eVar18 : pmc.eVar18,
		pmc_eVar41 : pmc.eVar41,
		pmc_eVar42 : pmc.eVar42,
		pmc_prop18 : pmc.prop18
	});
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
				//
				break;
			case "removeFromSaveForLater":
				//
				break;
			case "saveForLater":
				//
				break;
			case "removeFromCart":
				//
				break;
			default:
				;
		}
	}
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
						pmc_eVar18 : pmc.eVar18,
						pmc_prop18 : pmc.prop18
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
						pmc_eVar18 : pmc.eVar18,
						pmc_prop18 : pmc.prop18
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
						pmc_eVar18 : pmc.eVar18,
						pmc_prop18 : pmc.prop18
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
						pmc_eVar18 : pmc.eVar18,
						pmc_prop18 : pmc.prop18
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
					pmc_eVar18 : pmc.eVar18,
					pmc_prop18 : pmc.prop18
				});
			} else {
				utag.link({
					pmc_scAdd : "scAdd",
					pmc_event11 : "event11",
					pmc_event12 : "event12",
					pmc_event69 : "event69",
					pmc_event70 : "event70",
					pmc_products : pmc.getProductString(items),
					pmc_eVar18 : pmc.eVar18,
					pmc_prop18 : pmc.prop18
				});
			}
		}
	}
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
			pmc_eVar18 : pmc.eVar18,
			pmc_prop18 : pmc.prop18
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
			pmc_eVar18 : pmc.eVar18,
			pmc_prop18 : pmc.prop18
		});
	}
};

pmc.pageViewRecipePage = function() {
	pmc.setBasePageName();
	
	pmc.eVar9 = "recipe";
	if (pmc.eVar42 == "RECIPE" || (pmc.eVar42 == "M:RECIPE" && pmc.eVar41 != "MOBILE RECIPE HOME PAGE")) {
		pmc.pageName = pmc.removeHTML(digitalData.page.pageName.toLowerCase()).replace("recipe: ", "recipe:");
		pmc.event57 = "event57";
		pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = "recipe detail";
	}
		
	if(pmc.prop1 == "pages") {
		pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = "recipe";
	}
};

pmc.pageViewKnownPathnames = function() {
	if (document.location.pathname.match("/checkout/thanks.html") != null && digitalData.x_transaction != null) {
		pmc.pageName = pmc.pageType = "checkout:order confirmation"
		pmc.channel = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = "checkout";
		pmc.purchase();
		return true;
	}

	if (document.location.pathname.match("/shoppingcart/") != null && digitalData.page.pageCategory.primaryCategory != "Monogram Options" && digitalData.page.pageCategory.primaryCategory != "registry" && digitalData.page.pageCategory.primaryCategory != "style and quantity") {
		pmc.setBasePageName();
		pmc.cartReview();
		return true;
	}
	
	return false;
};

pmc.pageViewBrowsePage = function() {
	
		function indexOf_(arr, val) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] === val) {
					return i;
				}
			}
			return -1;
		}
	
		function parseUri(str) {
			var o = parseUri.options, m = o.parser[o.strictMode ? "strict" : "loose"].exec(str), uri = {}, i = 14;
	
			while (i--)
			uri[o.key[i]] = m[i] || "";
	
			uri[o.q.name] = {};
			uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) {
				if ($1)
					uri[o.q.name][$1] = $2;
			});
	
			return uri;
		};
	
		parseUri.options = {
			strictMode : false,
			key : ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
			q : {
				name : "queryKey",
				parser : /(?:^|&)([^&=]*)=?([^&]*)/g
			},
			parser : {
				strict : /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
				loose : /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
			}
		};
		
		function removeA(arr) {
			var what, a = arguments, L = a.length, ax;
			while (L > 1 && arr.length) {
				what = a[--L];
				while (( ax = indexOf_(arr, what)) !== -1) {
					arr.splice(ax, 1);
				}
			}
			return arr;
		}

		/*
		if (digitalData.x_state.giftGiver == true) {
			pmc.eVar9 = "registry:registry list gift giver";
		}
		if (digitalData.x_state.registrant == true) {
			pmc.eVar9 = "registry:registry list registrant";
		}
		if (digitalData.x_state.completionUser == true) {
			pmc.eVar9 = "registry:completion program registrant";
		}
		*/

		if (parseUri(window.location.href).host.match(/potterybarnkids.com/i) != null) {
			;
		} else {
			if (digitalData.page.pageCategory.categories != undefined) {
				if (digitalData.page.pageCategory.categories.length == 0) {
					;
				} else if (digitalData.page.pageCategory.categories.length == 1) {
					pmc.eVar1 = pmc.eVar2 = pmc.eVar3 = pmc.removeHTML(digitalData.page.pageCategory.categories[0]);
					pmc.prop1 = "supercategory";
					pmc.prop2 = pmc.removeHTML(digitalData.page.pageCategory.primaryCategory);
					pmc.prop3 = pmc.prop4 = pmc.prop5 = pmc.removeHTML(digitalData.page.pageCategory.primaryCategory + ":" + digitalData.page.pageCategory.categories[0]);
					pmc.pageName = pmc.prop5;
				} else if (digitalData.page.pageCategory.categories.length == 2) {
					pmc.eVar1 = pmc.removeHTML(digitalData.page.pageCategory.categories[0]);
					pmc.eVar2 = pmc.eVar3 = pmc.removeHTML(digitalData.page.pageCategory.categories[0] + ":" + digitalData.page.pageCategory.categories[1]);
					pmc.prop1 = "category";
					pmc.prop2 = pmc.removeHTML(digitalData.page.pageCategory.primaryCategory);
					pmc.prop3 = pmc.removeHTML(digitalData.page.pageCategory.primaryCategory + ":" + digitalData.page.pageCategory.categories[0]);
					pmc.prop4 = pmc.prop5 = pmc.removeHTML(digitalData.page.pageCategory.primaryCategory + ":" + digitalData.page.pageCategory.categories.join(":"));
					pmc.pageName = pmc.prop5;
				} else if (digitalData.page.pageCategory.categories.length >= 3) {
					pmc.eVar1 = pmc.removeHTML(digitalData.page.pageCategory.categories[0]);
					pmc.eVar2 = pmc.removeHTML(digitalData.page.pageCategory.categories[0] + ":" + digitalData.page.pageCategory.categories[1]);
					pmc.eVar3 = pmc.removeHTML(digitalData.page.pageCategory.categories[0] + ":" + digitalData.page.pageCategory.categories[1] + ":" + digitalData.page.pageCategory.categories[2]);
					pmc.prop1 = "subcategory";
					pmc.prop2 = pmc.removeHTML(digitalData.page.pageCategory.primaryCategory);
					pmc.prop3 = pmc.removeHTML(digitalData.page.pageCategory.primaryCategory + ":" + digitalData.page.pageCategory.categories[0]);
					pmc.prop4 = pmc.removeHTML(digitalData.page.pageCategory.primaryCategory + ":" + digitalData.page.pageCategory.categories[0] + ":" + digitalData.page.pageCategory.categories[1]);
					pmc.prop5 = pmc.removeHTML(digitalData.page.pageCategory.primaryCategory + ":" + digitalData.page.pageCategory.categories.join(":"));
					pmc.pageName = pmc.prop5;
				}
			} else {
				try {
					if (pmc.prop18 == "mobile site") {
						pmc.pageName = digitalData.page.pageName.toLowerCase();
						pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = digitalData.page.pageType;
					}
				} catch(e) {
					;
				}
			}
		}
		
		try {
			/* west elm PFM specific taxonomy */
			//if (parseUri(window.location.href).host.match(/westelm.com/i) != null) {
			//	if(parseUri(document.location.href).directory.split("/").indexOf("design-lab") > -1) {
			//		pmc.eVar9 = "shop";
			//	}
			//}
			/* end west elm PFM taxonomy */
			// update: this is handled in a Tealium Set Data Values extension.

			/* pb kids specific taxonomy */
			if (parseUri(window.location.href).host.match(/potterybarnkids.com/i) != null) {
				
				//console.log(removeA(removeA(removeA(parseUri(document.location.href).directory.split("/"), ""), "/"), "m"));
				if (removeA(removeA(removeA(parseUri(document.location.href).directory.split("/"), ""), "/"), "m").length == 0) {
					pmc.pageName = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = parseUri(document.location.href).file.split(".")[0].toLowerCase();
				} else {
					pmc.pageName = removeA(removeA(removeA(parseUri(document.location.href).directory.split("/"), ""), "/"), "m").join(":");
					if (parseUri(document.location.href).file != undefined) {
						if (parseUri(document.location.href).file.length > 0) {
							if (indexOf_(removeA(removeA(removeA(parseUri(document.location.href).directory.toLowerCase().split("/"), ""), "/"), "m"),"baby") > -1 || indexOf_(removeA(removeA(removeA(parseUri(document.location.href).directory.toLowerCase().split("/"), ""), "/"), "m"),"kids") > -1) {
								pmc.pageName = removeA(removeA(removeA(parseUri(document.location.href).directory.split("/"), ""), "/"), "m").join(":") + ":" + parseUri(document.location.href).file.split(".")[0].toLowerCase();
							} else {
								pmc.pageName = removeA(removeA(removeA(parseUri(document.location.href).directory.split("/"), ""), "/"), "m").splice(1,0,"all").join(":") + parseUri(document.location.href).file.split(".")[0].toLowerCase();
							}
						} else {
							//console.log("*********");
							//console.log("********* " + removeA(removeA(parseUri(document.location.href).directory.toLowerCase().split("/"), ""), "/"));
							if (indexOf_(removeA(removeA(removeA(parseUri(document.location.href).directory.toLowerCase().split("/"), ""), "/"), "m"),"baby") > -1 || indexOf_(removeA(removeA(removeA(parseUri(document.location.href).directory.toLowerCase().split("/"), ""), "/"), "m"),"kids") > -1) {
								pmc.pageName = removeA(removeA(removeA(parseUri(document.location.href).directory.split("/"), ""), "/"), "m").join(":");// + ":" + parseUri(document.location.href).file.split(".")[0]).toLowerCase();
							} else {
								// http://integration2.potterybarnkids.com/shop/sleepover/?cm_type=lnav
								var p_ = (removeA(removeA(removeA(parseUri(document.location.href).directory.split("/"), ""), "/"), "m"));
								p_.splice(indexOf_(p_,"shop")+1,0,["all"])
								pmc.pageName = p_.join(":").toLowerCase(); 
							}
						}
					}

					var pth = removeA(removeA(removeA(parseUri(document.location.href).directory.split("/"), ""), "/"), "m");

					pmc.prop1 = "supercategory"
					pmc.prop2 = "shop"

					if (indexOf_(removeA(removeA(removeA(parseUri(document.location.href).directory.toLowerCase().split("/"), ""), "/"), "m"),"baby") > -1 || indexOf_(removeA(removeA(removeA(parseUri(document.location.href).directory.toLowerCase().split("/"), ""), "/"), "m"),"kids") > -1) {
						//console.log("baby/kids");
						pmc.prop3 = pmc.prop4 = pmc.prop5 = pth.shift();
						
						if (removeA(removeA(removeA(parseUri(document.location.href).directory.split("/"), ""), "/"), "m").length >= 2) {
							var pth_ = pth.shift();

							(pth_ != undefined) ? (pmc.prop3 = (pmc.prop3 + ":" + pth_)) : pmc.prop3;
							(pth_ != undefined) ? (pmc.prop4 = (pmc.prop4 + ":" + pth_)) : pmc.prop4;
							(pth_ != undefined) ? (pmc.prop5 = (pmc.prop5 + ":" + pth_)) : pmc.prop5;
						}
						if (removeA(removeA(removeA(parseUri(document.location.href).directory.split("/"), ""), "/"), "m").length >= 3) {
							var pth_ = pth.shift();
							pmc.prop1 = "category";
							(pth_ != undefined) ? (pmc.prop4 = (pmc.prop4 + ":" + pth_)) : pmc.prop4;
							(pth_ != undefined) ? (pmc.prop5 = (pmc.prop5 + ":" + pth_)) : pmc.prop5;
						}
						if (removeA(removeA(removeA(parseUri(document.location.href).directory.split("/"), ""), "/"), "m").length >= 4) {
							var pth_ = pth.shift();
							pmc.prop1 = "subcategory";
							(pth_ != undefined) ? (pmc.prop5 = (pmc.prop5 + ":" + pth_)) : pmc.prop5;
						}
					} else {
						//console.log("all");
						pmc.prop3 = pmc.prop4 = pmc.prop5 = pth.shift() + ":all";

						if (removeA(removeA(removeA(parseUri(document.location.href).directory.split("/"), ""), "/"), "m").length >= 2) {
							var pth_ = pth.shift();
							pmc.prop1 = "category";
							//(pth_ != undefined) ? (pmc.prop3 += ":" + pth_) : pmc.prop3;
							(pth_ != undefined) ? (pmc.prop4 = (pmc.prop4 + ":" + pth_)) : pmc.prop4;
							(pth_ != undefined) ? (pmc.prop5 = (pmc.prop5 + ":" + pth_)) : pmc.prop5;
						}
						if (removeA(removeA(removeA(parseUri(document.location.href).directory.split("/"), ""), "/"), "m").length >= 3) {
							var pth_ = pth.shift();
							pmc.prop1 = "subcategory";
							//(pth_ != undefined) ? (pmc.prop4 += ":" + pth_) : pmc.prop4;
							(pth_ != undefined) ? (pmc.prop5 = (pmc.prop5 + ":" + pth_)) : pmc.prop5;
						}
					}
				}
			}
			/* end pb kids specific taxonomy */
		} catch(e) {
			;
		}
		
		if(digitalData.page.pageType == "category") {
			pmc.setRefinements();
		}
		 
	}; 


pmc.pageViewCheckoutPage = function() {

	//pmc.pageType = pmc.channel = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = digitalData.page.pageCategory.primaryCategory;
	//pmc.pageName = digitalData.page.pageCategory.primaryCategory + ":" + pmc.removeHTML(digitalData.page.pageName).toLowerCase();
	
	pmc.setBasePageName();
	pmc.pageType = pmc.channel = digitalData.page.pageCategory.primaryCategory;

	if (digitalData.page.pageName == "ACCOUNT: CHECKOUT SIGN IN") {
		//pmc.pageType = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.channel = "checkout: signin";
		if (digitalData.page.attributes.expressCheckout === true) {
			pmc.eVar4 = "express";
		} else if (digitalData.x_user && digitalData.x_user.profile) {
			pmc.eVar4 = "authenticated regular";
		} else {
			pmc.eVar4 = "guest regular";
		}
		pmc.event1 = "event1";
		//pmc.pageName = "checkout:signin";
		pmc.scCheckout = "scCheckout";
	} else if (digitalData.page.pageName == "ACCOUNT: EXPRESS CHECKOUT SIGN IN") {
		//pmc.pageType = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.channel = "checkout: signin";
		pmc.eVar4 = "express";
		pmc.event1 = "event1";
		//pmc.pageName = "checkout:signin";
		pmc.scCheckout = "scCheckout";
	} else if (digitalData.page.pageName == "SHIPPING" || digitalData.page.pageName == "CHECKOUT: SHIPPING " || pmc.pageName == "checkout:shipping") {
		//pmc.pageType = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.channel = "checkout: shipping";
		if (digitalData.page.attributes.expressCheckout === true) {
			pmc.eVar4 = "express";
		} else if (digitalData.x_user && digitalData.x_user.profile) {
			pmc.eVar4 = "authenticated regular";
		} else {
			pmc.eVar4 = "guest regular";
		}
		pmc.event2 = "event2";
		pmc.scCheckout = "scCheckout";
	} else if (digitalData.page.pageName == "Express Shipping Multiple" || digitalData.page.pageName == "Shipping Multiple" || digitalData.page.pageName == "CHECKOUT: SHIPPING MULTIPLE" || pmc.pageName == "checkout:multiple-shipping" ) {
		if (digitalData.page.attributes.expressCheckout === true) {
			pmc.eVar4 = "express";
		} else if (digitalData.x_user && digitalData.x_user.profile) {
			pmc.eVar4 = "authenticated regular";
		} else {
			pmc.eVar4 = "guest regular";
		}
		pmc.event3 = "event3";
	} else if (digitalData.page.pageName == "BILLING" || digitalData.page.pageName == "CHECKOUT: BILLING " || pmc.pageName == "checkout:billing") {
		//pmc.pageType = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.channel = "checkout: billing";
		if (digitalData.page.attributes.expressCheckout === true) {
			pmc.eVar4 = "express";
		} else if (digitalData.x_user && digitalData.x_user.profile) {
			pmc.eVar4 = "authenticated regular";
		} else {
			pmc.eVar4 = "guest regular";
		}
		pmc.event5 = "event5";
		pmc.scCheckout = "scCheckout";
	} else if (digitalData.page.pageName == "PAYMENT" || digitalData.page.pageName == "CHECKOUT: payment" || digitalData.page.pageName == "CHECKOUT: PAYMENT" || pmc.pageName == "checkout:payment") {
		//pmc.pageType = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.channel = "checkout: payment";
		if (digitalData.page.attributes.expressCheckout === true) {
			pmc.eVar4 = "express";
		} else if (digitalData.x_user && digitalData.x_user.profile) {
			pmc.eVar4 = "authenticated regular";
		} else {
			pmc.eVar4 = "guest regular";
		}
		pmc.event6 = "event6";
		pmc.scCheckout = "scCheckout";
	} else if (digitalData.page.pageName == "Delivery Gift Options" || digitalData.page.pageName == "CHECKOUT: Delivery Gift Options" || pmc.pageName == "checkout:deliveryoptions") {
		//pmc.pageType = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.channel = "checkout: delivery gift options";
		if (digitalData.page.attributes.expressCheckout === true) {
			pmc.eVar4 = "express";
		} else if (digitalData.x_user && digitalData.x_user.profile) {
			pmc.eVar4 = "authenticated regular";
		} else {
			pmc.eVar4 = "guest regular";
		}
		pmc.event4 = "event4";
	}
	//console.log("digitalData.component " + digitalData.component);
	
				
						
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
		utag_data["pmc_products"] = pmc.productString = pmc.getProductString(pmc.backorder.orderItems);
	}
};

pmc.pageViewShoppingPage = function () {
	pmc.pageType = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = "shopping";
	pmc.pageName = pmc.removeHTML(digitalData.page.pageName).toLowerCase();
	pmc.eVar9 = "bloomreach";
};

pmc.pageViewRegistryPage = function() {

	pmc.setBasePageName();
	pmc.pageType = "registry";
	if (window.location.pathname.match(/\/shoppingcart/) != null) {
		pmc.eVar34 = window.location.pathname.match(/\/shoppingcart\/[A-Za-z0-9]+\//).toString().replace(/\/shoppingcart\//g, "").replace(/\//g, "");
	} else {
		pmc.eVar34 = window.location.pathname.match(/\/registry\/[A-Za-z0-9]+\//).toString().replace(/\/registry\//g, "").replace(/\//g, "");
	}
	
	pmc.pageName = pmc.pageName.replace(":"+pmc.eVar34, "");
	pmc.prop1 = pmc.prop1.replace(":"+pmc.eVar34, "");
	pmc.prop2 = pmc.prop2.replace(":"+pmc.eVar34, "");
	pmc.prop3 = pmc.prop3.replace(":"+pmc.eVar34, "");
	pmc.prop4 = pmc.prop4.replace(":"+pmc.eVar34, "");
	pmc.prop5 = pmc.prop5.replace(":"+pmc.eVar34, "");

	if (pmc.pageName.match("registry-list") != null || pmc.pageName.match("completion-list") != null) {
		pmc.event45 = "event45";
		pmc.eVar9 = "registry";
		if (digitalData.x_state.giftGiver == true) {
			pmc.eVar9 = "registry:registry list gift giver";
		}
		if (digitalData.x_state.registrant == true) {
			pmc.eVar9 = "registry:registry list registrant";
		}
		if (digitalData.x_state.completionUser == true) {
			pmc.eVar9 = "registry:completion program registrant";
		} 
	}
	
	if (pmc.pageName.match("registry-list") != null) {
		pmc.prop1 = "registry list"; 
		return;
	}
	
	if (pmc.pageName.match("create-registry-confirmation") != null || pmc.pageName.match("congratulations-create") != null) {
		pmc.event44 = "event44"; 
		return;
	}
	
	if (pmc.pageName.match("registry-confirmation") != null) {
		pmc.pageName = "add item:add to registry";
		pmc.prop1 = "add to registry";
		pmc.prop2 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = "add item";
		return;
	}
	
	if (pmc.pageName == "shoppingcart:confirmation") {
		pmc.pageName = "add item:add to cart";
		pmc.prop1 = "add to cart";
		pmc.prop2 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = "add item";
		return;
	}
};

pmc.pageViewWishlistPage = function() {
	pmc.setBasePageName(); 
	if (window.location.pathname.match(/\/wishlist\/[A-Za-z0-9]+\//) != null) {
		pmc.wishlistID = window.location.pathname.match(/\/wishlist\/[A-Za-z0-9]+\//).toString().replace(/\/wishlist\//g, "").replace(/\//g, "");
		pmc.pageName = pmc.pageName.replace(":"+pmc.wishlistID, "");
		utag_data["pmc_eVar35"] = pmc.wishlistID;
	}
	pmc.pageType = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = "wishlist";

	if (digitalData.page.pageName == "WISHLIST: CREATOR VIEW" || digitalData.page.pageName == "WISHLIST: GIVER VIEW") {
		pmc.event45 = "event45";
	}
	pmc.eVar9 = "wishlist";
	
	if (digitalData.page.pageName.match(/CREATOR/gi) != null) {
		pmc.eVar9 = "wishlist:creator";
	}
	
	if (digitalData.page.pageName.match(/GIVER/gi) != null) {
		pmc.eVar9 = "wishlist:gift giver";
	}
};

pmc.pageViewStorePage = function() {
	pmc.setBasePageName(); 
};

pmc.pageViewCustomPage = function() {
	pmc.setBasePageName();
	pmc.pageType = pmc.prop1; 
};

pmc.pageViewRoomPage = function() {
	pmc.pageType = digitalData.page.pageCategory.primaryCategory;
	pmc.setBasePageName();
	pmc.eVar9 = "shop";
};

pmc.pageViewInternationalCheckout = function() {
	pmc.pageType = "internationalcheckout";
	pmc.setBasePageName(); 
	pmc.eVar4 = "international";
	if (digitalData.x_transaction) {
		if (digitalData.x_transaction.orders) {
			pmc.event58 = "event58";
			pmc.purchase();
		}
	}
};

pmc.pageViewCustomerServicePage = function() {

	pmc.setBasePageName(); 

	// workaround for pbteen
	if (pmc.eVar41 == "CUSTOMER SERVICE:EMAIL SIGNUP THANKYOU") {
		pmc.event32 = "event32";
	} 
};

pmc.pageViewRecommendationsPage = function() { 
	pmc.setBasePageName(); 
	return; 
};

pmc.pageViewGiftPage = function() { 
	pmc.setBasePageName();  
	pmc.pageType = "gift"
	pmc.eVar9 = "shop";
	return; 
};

pmc.pageViewDesignStudioPage = function() {
	pmc.setBasePageName();
	pmc.eVar9 = "design studio";
	return; 
};

pmc.pageView = function() {
	
	// debug mode
	this.setDebugMode();
	this.debugStatus("BEGIN pageView()");
    //console.log(digitalData);
	if (typeof digitalData != "undefined") {
		
		pmc.urlVariables = pmc.searchToJSON();
		
		if (digitalData.page && digitalData.page.attributes != undefined) {
			
			if (digitalData.x_user) {
				if(digitalData.x_user.profile != undefined) {
					if(digitalData.x_user.profile.profileEmail != undefined) {
						pmc.eVar43 = digitalData.x_user.profile.profileEmail;  
						pmc.eVar48 = "authenticated";
						pmc.event51 = "event51";
						pmc.event53 = "event53";
					}
				}
			}
			
			if(typeof digitalData.page.attributes.cmPageId != "undefined") {
				pmc.eVar41 = digitalData.page.attributes.cmPageId;
				pmc.prop6 = "D=v41";
				
			}
			if(typeof digitalData.page.attributes.cmCategoryId != "undefined") {
				pmc.eVar42 = digitalData.page.attributes.cmCategoryId.split("||NOFACET")[0];
				if(pmc.eVar42 != "") {
					pmc.prop7 = "D=v42";
				}
			}
			if (typeof digitalData.page.attributes.emailAddress != "undefined") {
				pmc.eVar43 = digitalData.page.attributes.emailAddress;
				pmc.event53 = "event53";
			}
			
			if (digitalData.page.attributes.mobile == true) {
				pmc.prop18 = pmc.eVar18 = "mobile site";
			}
			
			if (digitalData.page.attributes.accountCreated == "true" || digitalData.page.attributes.accountCreated == true) {
				pmc.event52 = "event52";
				pmc.eVar48 = "authenticated";
				if (digitalData.x_user) {
					if(digitalData.x_user.profile != undefined) {
						if(digitalData.x_user.profile.profileEmail != undefined) {
							pmc.eVar43 = digitalData.x_user.profile.profileEmail;  
							pmc.event53 = "event53";
						}
					}
				}
			}
			
			if (typeof pmc.eVar41 != "undefined") {
					if (pmc.eVar41.match(/CUSTOMER SERVICE:CATALOG REQUEST THANKYOU/gi)) {
						pmc.event30 = "event30";
					}
					if (pmc.eVar41.match(/CUSTOMER SERVICE:CATALOG REQUEST:THANKYOU/gi)) {
						pmc.event30 = "event30";
					}
					if (pmc.eVar41.match(/MONOGRAM OPTIONS/gi)) {
						pmc.personalizationStart(digitalData.page.attributes.groupId);
					}
				}
			
		}
		
		/*
		if (typeof digitalData.page.attributes.pageNumber != "undefined") {
			pmc.prop20 = digitalData.page.attributes.pageNumber + "";
		}
		if (typeof digitalData.page.attributes.viewAll != "undefined") {
			if (digitalData.page.attributes.viewAll == true) {
				pmc.prop20 = "view all";
			}
		}
		*/
		
		if (pmc.pageViewKnownPathnames() == true) {
			return;
		}
		/*
		try {
			if (pmc.urlVariables.cm_em != undefined) {
				pmc.eVar43 = pmc.urlVariables.cm_em;
				pmc.event53 = "event53";
			}
		} catch (e) {
			;
		}
		*/	
		try {
			if (digitalData.page && digitalData.page.pageCategory != undefined) {
				
				pmc.prop1 = "unknown";
				pmc.pageType = "unknown";
		
				if (digitalData.page.pageCategory.primaryCategory == "shop") {
					pmc.pageType = digitalData.page.pageCategory.primaryCategory;
					pmc.pageViewBrowsePage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "products") {
					pmc.pageType = "product detail";
					pmc.pageViewProductDetailsPage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "recipe") {
					pmc.pageType = pmc.prop1 = "recipe";
					pmc.pageViewRecipePage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "search") {
					pmc.pageType = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = "search";
					pmc.pageViewSearchPage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "home") {
					pmc.pageViewHomePage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "customer-service") {
					pmc.pageViewCustomerServicePage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "registry") {
					pmc.pageViewRegistryPage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "wishlist") {
					pmc.pageViewWishlistPage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "checkout") {
					pmc.pageViewCheckoutPage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "shoppingcart") {
					/*
					 if (digitalData.page.pageName == "MONOGRAM OPTIONS") {
					 pmc.pageType = pmc.prop1 = "product personalization";
					 pmc.pageName = pmc.removeHTML(digitalData.page.pageName).toLowerCase();
					 pmc.event49 = "event49";
					 }
					 */
					return; 
				} else if (digitalData.page.pageCategory.primaryCategory == "pages") {
					pmc.pageViewCustomPage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "room") {
					pmc.pageViewRoomPage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "account") {
					pmc.pageType = "account";
					pmc.pageViewAccountPage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "stores") {
					pmc.pageViewStorePage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "internationalcheckout") {
					pmc.pageViewInternationalCheckout();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "design-studio") {
					pmc.pageViewDesignStudioPage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "recommendations") {
					pmc.pageViewRecommendationsPage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "gift") {
					pmc.pageViewGiftPage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "shopping") {
					pmc.pageType = "shopping";
					pmc.pageViewShoppingPage();
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "cbcc") {
					pmc.pageType = pmc.prop1 = pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = "cbcc";
					pmc.pageName = pmc.removeHTML(digitalData.page.pageName).toLowerCase();
					if (pmc.pageName.match(/ic communication error/gi)) {
						pmc.pageName = "cbcc:ccerror";
					}
					if (pmc.pageName.match(/credit card landing - ic/gi)) {
						pmc.pageName = "cbcc:cc landing";
					}
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "Monogram Options") {
					pmc.pageName = "product: monogram options";
					pmc.pageType = pmc.prop1 = "monogram options";
					pmc.prop2 = pmc.prop3 = pmc.prop4 = pmc.prop5 = "product";
					return;
				} else if (digitalData.page.pageCategory.primaryCategory == "style and quantity") {
					pmc.pageType = "style and quantity";
					pmc.pageViewStyleQuantityPage();
					return;
				} else {
					try {
						pmc.setBasePageName();
					} catch(e) {
						pmc.pageName = "unknown";
					}
				}
				
				
			}
		} catch (e) {
			;
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
		pmc_eVar18 : pmc.eVar18,
		pmc_prop18 : pmc.prop18
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
		pmc_eVar18 : pmc.eVar18,
		pmc_prop18 : pmc.prop18
		
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
		pmc_eVar18 : pmc.eVar18,
		pmc_prop18 : pmc.prop18
	});
};

pmc.personalizationStart = function(groupID) {
	pmc.event49 = "event49";
	pmc.productString  = ";" + groupID;
	return;
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
					pmc_eVar18 : pmc.eVar18,
					pmc_prop18 : pmc.prop18
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
					pmc_eVar18 : pmc.eVar18,
					pmc_prop18 : pmc.prop18
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
			pmc_eVar18 : pmc.eVar18,
			pmc_prop18 : pmc.prop18
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
			pmc_eVar18 : pmc.eVar18,
			pmc_prop18 : pmc.prop18
		});
	} 
};	

pmc.registerCallbacks = function() {

	WSI.dataLayer.registerCallback(function(a, b, c) {
		//console.log("Callback: ", a, b, c);
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
					pmc_eVar18 : pmc.eVar18,
					pmc_eVar41 : c.page.attributes.cmPageId,
					pmc_eVar42 : c.page.attributes.cmCategoryId,
					pmc_prop18 : pmc.prop18
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
					pmc_eVar18 : pmc.eVar18,
					pmc_prop18 : pmc.prop18
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
					pmc_eVar18 : pmc.eVar18,
					pmc_prop18 : pmc.prop18

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
						pmc_eVar18 : pmc.eVar18,
						pmc_prop18 : pmc.prop18
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
						pmc_eVar18 : pmc.eVar18,
						pmc_prop18 : pmc.prop18
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
										pmc_eVar18 : pmc.eVar18,
										pmc_prop18 : pmc.prop18,
										pmc_event72 : "event72",
										pmc_prop73 : b.data.data.productId.substring(0, 99)
									});
								} else {
									utag.link({
										pmc_prop72 : b.data.data.campaign.substring(0, 48) + "|" + b.data.data.placement.substring(0, 48),
										link_text : "content personalization - element interaction",
										pmc_prop19 : "",
										pmc_eVar18 : pmc.eVar18,
										pmc_prop18 : pmc.prop18,
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
					pmc_eVar18 : pmc.eVar18,
					pmc_prop18 : pmc.prop18
				});
			} else if(b.name == "elementInteraction" && b.data.item.match(/MULTI-SHIP EXPAND LINE/gi) != null) { 
				utag.link({
					pmc_prop13 : pmc.removeHTML(b.data.category + ":" + b.data.item),
					link_text : "element interaction",
					pmc_prop19 : "",
					pmc_eVar18 : pmc.eVar18,
					pmc_prop18 : pmc.prop18
				});
			} else if(b.name == "elementInteraction" && b.data.item.match(/MULTI-SHIP COLLAPSE LINE/gi) != null) { 
				utag.link({
					pmc_prop13 : pmc.removeHTML(b.data.category + ":" + b.data.item),
					link_text : "element interaction",
					pmc_prop19 : "",
					pmc_eVar18 : pmc.eVar18,
					pmc_prop18 : pmc.prop18
				});
			} else if(b.name == "elementInteraction" && b.data.item.match(/GIFT ORDER YES/gi) != null) { 
				utag.link({
					pmc_prop13 : pmc.removeHTML(b.data.category + ":" + b.data.item),
					link_text : "element interaction",
					pmc_prop19 : "",
					pmc_eVar18 : pmc.eVar18,
					pmc_prop18 : pmc.prop18
				});
			} else if(b.name == "elementInteraction" && b.data.item.match(/SHIPPING SAME AS BILLING/gi) != null) { 
				utag.link({
					pmc_prop13 : pmc.removeHTML(b.data.category + ":" + b.data.item),
					link_text : "element interaction",
					pmc_prop19 : "",
					pmc_eVar18 : pmc.eVar18,
					pmc_prop18 : pmc.prop18
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
								pmc_eVar18 : pmc.eVar18,
								pmc_prop18 : pmc.prop18
							});
						} else if(b.data.name) {
							utag.link({
								pmc_event47 : "event47",
								pmc_prop14 : pmc.removeHTML(b.data.category + ":" + b.data.name),
								pmc_eVar21 : pmc.removeHTML(b.data.category + ":" + b.data.name),
								link_text : "element interaction",
								pmc_products : ";" + c.product.productID.prodID,
								pmc_prop19 : "",
								pmc_eVar18 : pmc.eVar18,
								pmc_prop18 : pmc.prop18
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
										pmc_pageName : pmc.pageName,
										pmc_eVar1 : pmc.eVar1,
										pmc_eVar2 : pmc.eVar2,
										pmc_eVar3 : pmc.eVar3,
										pmc_eVar41 : pmc.eVar41,
										pmc_eVar42 : pmc.eVar42,
										pmc_prop1 : pmc.prop1,
										pmc_prop2 : pmc.prop2,
										pmc_prop3 : pmc.prop3,
										pmc_prop4 : pmc.prop4,
										pmc_prop5 : pmc.prop5,
										pmc_prop6 : pmc.prop6,
										pmc_prop7 : pmc.prop7,
										pmc_prop20 : b.data.newPage,
										pmc_eVar18 : pmc.eVar18,
										pmc_prop18 : pmc.prop18
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
									pmc_eVar18 : pmc.eVar18,
									pmc_prop18 : pmc.prop18
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
									pmc_eVar18 : pmc.eVar18,
									pmc_prop18 : pmc.prop18
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
			if (b.name === "addComponent" && 
				b.data && b.data.data && b.data.name && 
				b.data.name.indexOf("Personalized Content") > -1 ) {

				if ( b.data.data.programStatus !== "INELIGIBLE" ) {
					var placementDetails=[b.data.data.programStatus,
							      b.data.data.campaign.substring(0, 48),
							      b.data.data.placement.substring(0, 49),
							      b.data.data.productId.substring(0, 99)];
					if ( typeof utag_data["pmc_list1"] === "undefined" ) {
						utag_data["pmc_list1"] = placementDetails.join("|");
					} else {
						utag_data["pmc_list1"] = utag_data["pmc_list1"] + ";" + placementDetails.join("|");
					}
				}

				utag_data["pmc_event71"] = "event71";
				utag_data["pmc_eVar71"] = "TEST/CONTROL";
			}
		}
	}, true)	
};

try {
	window.utag_cfg_ovrd = {
	  noview : true,
	};
	pmc.registerCallbacks();
	pmc.pageView();
        setTimeout( function(){ 
	  utag.view(utag_data);
	}, 500);
	
} catch(e) {
	;
}
//pmc;

