/**
 * The following code uses Helium to run a test suite on uat3.williams-sonoma.com 
 * The tests run are based off of the Product interaction and Purchase Funnel Test Cases doc
 * Authors: RAnderson, NNogales.
 */

import static com.heliumhq.API.*;
import java.io.*;
import java.lang.*;

public class WSIRegressionUAT3 {
    
    static PrintStream a = System.out;
    public static String domain = "www.uat3.williams-sonoma.com";
    public static String authentity = "http://wsqauser:SupC00k$@";
    public static String defaultBrowser = "Chrome";
    
    // Starts a browser instance of the desired type according to the argument passed.
    // Defaults to Google Chrome.
    public static void startBrowser(String browser) {
        if (browser == "Firefox") {
            startFirefox(authentity + domain);
        }
        else if (browser == "IE") {
            startIE(authentity + domain);
        }
        else {
            startChrome(authentity + domain);
        }
    }
    
    // Checks to see if the close X is present, clicks it if so.
    public static void checkForOverlay() {
        try { Thread.sleep(3000); } catch (InterruptedException ex)  { System.out.println("Thread couldn't sleep"); }
        while ($(".overlayCloseButton").exists()) {
           // System.out.println("Inside loop");
            click($(".overlayCloseButton"));  
            try { Thread.sleep(1000); } catch (InterruptedException ex)  { System.out.println("Thread couldn't sleep the second time"); }      
        }
    }

    public static void buyCookware() {
        goTo("www.uat3.williams-sonoma.com/products/ws-stainless-steel-thermo-clad-15-piece-cookware-set/?pkey=ccookware-sets||");
        click("Add to Cart");
        click("Checkout");

        write("4", into($(".storetext")));
       // a.println("Got to comment 2");
        click($("[name='recalculate']"));
        write("2", into($(".storetext")));
       // a.println("Got to comment 2");
        click($("[name='recalculate']"));
        goTo("secure.uat3.williams-sonoma.com/checkout/shipping.html");
        write("Just Testing", into(TextField("Full Name")));
        write("1801 12th Ave North", into(TextField("Address")));
        write("Bellevue", into(TextField("City")));
        select("State", "Washington");
        write("98144", into(TextField("Zip")));
        write("2066903443", into(TextField("Daytime Phone")));
        click($("@continue"));
    }

    //Clicks on Quicklook on a product on PotteryBarnKids.
    public static void productQuicklook() {
        goTo(authentity + "www.uat3.potterybarnkids.com/shop/bedding/girls-duvet-covers/?");
        checkForOverlay();
        click("Quicklook");
        try { Thread.sleep(3000); } catch (InterruptedException ex)  { System.out.println("Thread couldn't sleep"); }
    }

//TODO: Check best practice for passing parameters in Java.
    public static void pipPageView(String page) {
        goTo(authentity + page);
    }

// Adds a Santoku Knife to registry
    public static void addToRegistry() {
        goTo(authentity + domain + "/products/shun-classic-hollow-ground-5in-santoku-knife/?transid=177819589008&pkey=ccutlery-santoku-knives%7C%7C&cm_src=E:cutlery-santoku-knives");
        checkForOverlay();
        click($("li.attributeValue a"));
        write("1", into($(".qty")));
        click("Add to Registry");
        write("bstewart@pointmarc.com", into(TextField("email")));
        write("Password1", into(TextField("password")));
        click(Button("Sign In"));
        click($("#anchor-btn-continue"));
    }

//Adds Turkish Hydrocotton hand towel to wishlist.    
    public static void addToWishlist() {
        goTo(authentity + "www.uat3.markandgraham.com/products/turkish-hydro-cotton-towel-set-gray/?acctsignin=true&transid=682611204009");
        checkForOverlay();
        click($("li.attributeValue a"));
        write("1", into($(".qty")));
        click("Add to Wishlist");
    }

    public static void increaseProductInCart() {
        goTo(authentity + domain + "/products/all-clad-d5-stainless-steel-10-piece-cookware-set/?pkey=ccookware-sets%7C%7C");
        click("Add to Cart");
        click("Continue Shopping");
        click("Cart");
        write("2", into("Quantity"));
        click($("@recalculate"));
        write("1", into("Quantity"));
        click($("@recalculate"));
    }

    public static void cartViews() {
        goTo(authentity + domain + "/products/all-clad-d5-stainless-steel-10-piece-cookware-set/?pkey=ccookware-sets%7C%7C");
        click("Add to Cart");
        click("Continue Shopping");
        click("Cart");
    }

    // pass no parameters to perform checkout as a guest
    public static void purchaseFunnel() {
        purchaseFunnel("guest", "guest");
    }

    public static void purchaseFunnel(String login, String password) {
        PMCT.watchFor("event18");
        goTo(authentity + domain + "/products/all-clad-d5-stainless-steel-10-piece-cookware-set/?pkey=ccookware-sets%7C%7C");
        PMCT.expect("v24").is("First Visit");

        PMCT.watchFor("scView");
        checkForOverlay();
        click("Add to Cart");
        click("Checkout");
        click($("input.rollover.checkoutButton"));

        if (login == "guest") {
            click($("#continueAsGuest"));
        } else {
            write(login, into("Email"));
            write(password, into("Password"));
            click("Sign In");
        }
        PMCT.expect("v42").is("CHECKOUT");

//        // Shipping Address
//        write("Test Test", into("Full Name"));
//        write("1234 Test Lane", into("Address"));
//        write("Testopolis", into("City"));
//        select("State", "Washington");
//        write("98004", into("Zip"));
//        write("800.929.3114", into("Daytime Phone"));
//        click($("@continue"));
//
//        // Delivery and Gift Options
//        click($("@continue"));
//
//        // Billing Address
//        if (login != "guest") {
//            click("Use This Address");
//        }
//
//        // Billing Information
//        select("Card Type", "Visa");
//        select("Expiration", "01");
//        select("Expiration Year", "2025");
//        write("4111111111111111", into("Card Number"));
//        write("111", into("Security Code"));
//        write("test@test.com", into("Email"));
//        write("test@test.com", into("Confirm Email"));
//        click($("#placeOrder"));
    }

    public static void main(String[] args) {
        setDriver(PMCT.start(PMCT.browserType.FIREFOX));
        PMCT.setReqUrl("metrics.williams-sonoma.com");

        // checkForOverlay();
        // pipPageView(domain + "/products/nesmuk-janus-slicer/?pkey=ccutlery-slicers||&cm_src=Quickbuy&sku=9988705&qty=1");
        // buyCookware();
        // addToRegistry();
        // addToWishlist();
//         productQuicklook();
        // increaseProductInCart();
        // cartViews();
         purchaseFunnel();
//TODO: Change URL structure to be more modular.
//        pipPageView(authentity + "www.uat3.markandgraham.com/products/make-your-mark-white-cotton-collection-numbers/?pkey=cpersonalized-bedding-collections&&cpersonalized-bedding-collections");

        PMCT.stop();
        killBrowser();
   }
}
