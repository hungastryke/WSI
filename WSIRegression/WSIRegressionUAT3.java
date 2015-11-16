/**
 * The following code uses Helium to run a test suite on uat3.williams-sonoma.com 
 * The tests run are based off of the Product interaction and Purchase Funnel Test Cases doc
 * Authors: RAnderson, NNogales.
 */
import static com.heliumhq.API.*;
import java.io.*;
import java.io.IOException; 
import java.io.FileOutputStream;
import java.io.FileNotFoundException;
import java.lang.*;

public class WSIRegressionUAT3 {
    
    
    // Starts a browser instance of the desired type according to the argument passed.
    // Defaults to Google Chrome.
    public static void startBrowser(String browser) {
        if (browser == "Firefox") {
            startFirefox("http://wsqauser:SupC00k$@www.uat3.williams-sonoma.com");
            //startFirefox("http://www.williams-sonoma.com/");
        }
        else if (browser == "IE") {
            startIE("http://wsqauser:SupC00k$@www.uat3.williams-sonoma.com");
        }
        else {
            startChrome("http://wsqauser:SupC00k$@www.uat3.williams-sonoma.com");
        }
        //Clicks twice to get through the subscription lightboxes that show up on first load
        click(Point(5,5));
        click(Point(5,5));
    }

    public static void buyCookware() {
        goTo("www.uat3.williams-sonoma.com/products/ws-stainless-steel-thermo-clad-15-piece-cookware-set/?pkey=ccookware-sets||");
        click("Add to Cart");
        click("Checkout");
        goTo("secure.uat3.williams-sonoma.com/checkout/shipping.html");
        write("Just Testing", into(TextField("Full Name")));
        write("1801 12th Ave North", into(TextField("Address")));
        write("Bellevue", into(TextField("City")));
        select("State", "Washington");
        write("98144", into(TextField("Zip")));
        write("2066903443", into(TextField("Daytime Phone")));
        // click($("fieldset.action-buttons input"));
        // click($("fieldset.action-buttons input"));
        click($("@continue"));
    }

    public static void productQuicklook() {
        goTo("http://www.uat3.potterybarnkids.com/shop/bedding/girls-duvet-covers/?");
        click(Point(50, 50));
        click("Quicklook");

    }

    public static void pipPageView() {
        goTo("http://www.uat3.williams-sonoma.com/products/nesmuk-janus-slicer/?pkey=ccutlery-slicers||&cm_src=Quickbuy&sku=9988705&qty=1");
        waitUntil(Text("Nesmuk").exists);
    }

    public static void addToRegistry() {
        goTo("http://www.uat3.williams-sonoma.com/products/shun-classic-hollow-ground-5in-santoku-knife/?transid=177819589008&pkey=ccutlery-santoku-knives%7C%7C&cm_src=E:cutlery-santoku-knives");
        //goTo("http://www.williams-sonoma.com/products/shun-classic-hollow-ground-5in-santoku-knife/?transid=177819589008&pkey=ccutlery-santoku-knives%7C%7C&cm_src=E:cutlery-santoku-knives");
        // if($("#emailAddr").exists()) {
        //     click(Point(50, 50));
        // }

        // if($("#ad_email_field").exists()) {
        //     click(Point(50, 50));
        // }
        click(Point(50, 50));
        click(Point(50, 50));
        click($("li.attributeValue a"));
        write("1", into($(".qty")));
        click("Add to Registry");
        write("bstewart@pointmarc.com", into(TextField("email")));
        write("Password1", into(TextField("password")));
        click(Button("Sign In"));
        click($("#anchor-btn-continue"));
    }

    public static void main(String[] args) {
        startBrowser("Chrome");
        //productQuicklook();
        //pipPageView();
        buyCookware();
        //addToRegistry();

        killBrowser();
   }
}
