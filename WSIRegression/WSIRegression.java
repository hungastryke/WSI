/**
 * The following code uses Helium to run a test suite on williams-sonoma.com 
 * The tests run are based off of the Product interaction and Purchase Funnel Test Cases doc
 * Authors: RAnderson, NNogales.
 */
import static com.heliumhq.API.*;
import java.io.*;
import java.io.IOException; 
import java.io.FileOutputStream;
import java.io.FileNotFoundException;
import java.lang.*;

public class WSIRegression {
    
    
// Starts a browser instance of the desired type according to the argument passed.
// Defaults to Google Chrome.
    public static void startBrowser(String browser) {
        if (browser == "Firefox") {
            startFirefox("www.williams-sonoma.com");
    }
        else if (browser == "IE") {
            startIE("www.williams-sonoma.com");
    }
        else {
            startChrome("www.williams-sonoma.com");
        }
    }

    public static void buyCookware() {
        
        if($("#ad_email_field").exists()) {

            click(Point(50, 50));
        }

        click("Cookware");
        click("Cookware Sets");
        goTo("http://www.williams-sonoma.com/products/ws-stainless-steel-thermo-clad-15-piece-cookware-set/?pkey=ccookware-sets||");
        click("Add to Cart");
        click("Checkout");
        goTo("https://secure.williams-sonoma.com/checkout/shipping.html");
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


    public static void main(String[] args) {  
        startBrowser("Chrome");
        buyCookware();
        killBrowser();
   }
}
