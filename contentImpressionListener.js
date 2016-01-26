/**
 * This listener is responsible for content impression events/tags.
 * The listener is esentially a callback provided to WSI DataLayer.
 * WSI DataLayer works on a publisher/subscriber model - anytime it fires a dynamic
 * event, it internally executes the registered listeners or callbacks.
 * DataLayer doesn't differentiate between listeners and executes every registered listener
 * for ever event; hence, it's up to the listener to not only filter events but also to
 * execute the required code for each event.
 * This listener is responsible for only content impressions and will ignore all other events.
 *
 * @author: gbhutani@wsgc.com
 * @version: 0.1
 * @date: 1/12/16
**/

if ( WSI && WSI.dataLayer ) {
    WSI.dataLayer.registerCallback( function( oldDigitalData, dataLayerEvent, newDigitalData ) {

        //Event data
        var dataLayerEventData = dataLayerEvent.data || dataLayerEvent,
            validVideoImpressionEvent = ( typeof dataLayerEventData.type !== "undefined" && dataLayerEventData.title !== "undefined" && dataLayerEventData.type === "video" ),
            validPersonalizedContentImpressionEvent = ( typeof dataLayerEventData.programStatus !== "undefined" && dataLayerEventData.programStatus !== "INELIGIBLE" || dataLayerEventData.type === "personalizedContent" );

        //Check if the event is content impression
        if ( dataLayerEvent.name === "contentImpression" ) {
            //Check if it's a video impression
            if ( validVideoImpressionEvent ) {
                //Product within the event data
                var digitalDataProduct = digitalData.product;

                //Check if product data is defined
                if (digitalDataProduct !== undefined && digitalDataProduct.productID !== undefined && digitalDataProduct.productID.prodID !== undefined) {
                    //Fire the link event
                    utag.link({
                        pmc_event54 : "event54",
                        pmc_eVar19 : dataLayerEventData.title,
                        pmc_products : ";" + digitalDataProduct.productID.prodID + ";;;event54=1"
                    });
                }
            }
            //Check if it's a personalized content impression
            else if ( validPersonalizedContentImpressionEvent ) {

                //Set content impression variables
                var campaignStatus = [],
                    eventDataCampaignStatus = dataLayerEventData.campaignStatus,
                    eventDataCampaign = typeof dataLayerEventData.campaign,
                    eventDataPlacement = dataLayerEventData.placement,
                    eventDataProductId = dataLayerEventData.productId,
                    eventDataTreatment = dataLayerEventData.treatment;

                utag_data["pmc_eVar71"] = dataLayerEventData.programStatus;

                //If campaign status exists, populate it
                if ( typeof eventDataCampaignStatus !== "undefined" && eventDataCampaignStatus.length > 0 ) {
                    campaignStatus.push( eventDataCampaignStatus );
                } else {
                    campaignStatus.push("");
                }
                //If campaign exists, populate it
                if ( typeof eventDataCampaign !== "undefined" && eventDataCampaign.length > 0 ) {
                    campaignStatus.push( eventDataCampaign );
                } else {
                    campaignStatus.push("");
                }
                utag_data["pmc_eVar72"] = campaignStatus.join("|");

                //If placement exists, populate it
                if( eventDataPlacement !== "undefined" && eventDataPlacement.length > 0 ) {
                    utag_data["pmc_eVar73"] = dataLayerEventData.placement;
                }
                //If productId exists, populate it
                if( typeof eventDataProductId !== "undefined" && eventDataProductId.length > 0 ) {
                    utag_data["pmc_eVar74"] = eventDataProductId.substring(0, 99);
                }
                //If treatment exists, populate it
                if( typeof eventDataTreatment != "undefined" && eventDataTreatment.length > 0 ) {
                    utag_data["pmc_eVar75"] = eventDataTreatment;
                }
                //utag_data["pmc_event71"] = "event71";

                //Fire a link tag
                utag.link({
                    //pmc_event71 : utag_data["pmc_event71"],
                    pmc_event71 : "event71",
                    pmc_eVar71 : utag_data["pmc_eVar71"],
                    pmc_eVar72 : utag_data["pmc_eVar72"],
                    pmc_eVar73 : utag_data["pmc_eVar73"],
                    pmc_eVar74 : utag_data["pmc_eVar74"],
                    pmc_eVar75 : utag_data["pmc_eVar75"]
                });
            }
        }
    }, true );
}
