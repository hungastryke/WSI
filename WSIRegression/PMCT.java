import net.lightbody.bmp.BrowserMobProxy;
import net.lightbody.bmp.BrowserMobProxyServer;
import net.lightbody.bmp.client.ClientUtil;
import net.lightbody.bmp.core.har.Har;
import net.lightbody.bmp.core.har.HarEntry;
import net.lightbody.bmp.core.har.HarNameValuePair;
import net.lightbody.bmp.core.har.HarRequest;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;
import java.io.IOException;
import java.util.*;

public class PMCT {
    // allows us to filter HTTP requests down to the tags we're looking for
    private static String reqUrlFragment;
    private static Har har;
    private static BrowserMobProxy proxy;
    private static String event;
    private static HashMap<String, String> queryPairs;

    public static Expect testCase = new Expect();

    public static WebDriver start(String browser, String urlFragment) {
        // start the proxy
        proxy = new BrowserMobProxyServer();
        proxy.start(0);

        // get the Selenium proxy object
        Proxy seleniumProxy = ClientUtil.createSeleniumProxy(proxy);

        // configure it as a desired capability
        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setCapability(CapabilityType.PROXY, seleniumProxy);

        WebDriver driver;

        if (Objects.equals(browser, "Chrome")) {
            driver = new ChromeDriver(capabilities);
        } else if (Objects.equals(browser, "Firefox")) {
            driver = new FirefoxDriver(capabilities);
        } else if (Objects.equals(browser, "IE")) {
            driver = new InternetExplorerDriver(capabilities);
        } else {
            driver = new FirefoxDriver(capabilities);
        }

        proxy.newHar();
        reqUrlFragment = urlFragment;

        return driver;
    }

    // used to construct english-like grammar for test cases - example: expect("v1").is("Home Page")
    public static class Expect {
        public String key;

        public void is(String val) {
            String foundValue;

            if (queryPairs.containsKey(key)) {
                foundValue = queryPairs.get(key);
                if (Objects.equals(val, foundValue)) {
                    System.out.println("Pass: '" + key + "' is '" + val + "'");
                } else {
                    System.out.println("FAIL: Expected '" + key + "' to be '" + val + "', was '" + foundValue + "' instead!");
                }
            } else {
                System.out.println("ERROR: Key '" + key + "' not found!");
                System.out.print(queryPairs);
            }
        }

        public void contains(String val) {
            String foundValue;

            if (queryPairs.containsKey(key)) {
                foundValue = queryPairs.get(key);
                if (foundValue.contains(val)) {
                    System.out.println("Pass: '" + key + "' contains '" + val + "'");
                } else {
                    System.out.println("FAIL: Expected '" + key + "' to contain '" + val + "', was '" + foundValue + "' instead!");
                }
            } else {
                System.out.println("ERROR: Key '" + key + "' not found!");
                System.out.print(queryPairs);
            }
        }
    }

    public static Expect expect(String key) {
        // get the HAR data if it hasn't been built by a previous expect call
        if (har == null) {
            boolean eventFound = false;
            har = proxy.getHar();

            List<HarEntry> entryList = har.getLog().getEntries();

            // search for the tag fire HTTP request
            for (HarEntry entry : entryList) {
                HarRequest req = entry.getRequest();
                if (req.getUrl().contains(reqUrlFragment)) {
                    queryPairs = new HashMap<>();

                    //create hashmap of querystring params to search through later
                    for (HarNameValuePair pair : req.getQueryString()) {
                        queryPairs.put(pair.getName(), pair.getValue());
                    }

                    // make sure this is the tag containing the event we're looking for
                    // if it isn't, keep looking
                    Set<String> eventSet = new HashSet<String>(Arrays.asList(queryPairs.get("events").split(",")));
                    if (eventSet.contains(event)) {
                        eventFound = true;
                        break;
                    }
                }
            }

            if (queryPairs == null) {
                System.out.println("ERROR: No requests found with url fragment '" + reqUrlFragment + "'");
            } else if (!eventFound) {
                System.out.println("WARNING: event '" + event + "' not found!");
            }
        }

        testCase.key = key;
        return testCase;
    }

    // reset stored data so we can begin logging new requests
    public static void watchFor(String tagEvent) {
        System.out.println("Watching for " + tagEvent + "...");
        har = null;
        proxy.newHar();
        queryPairs = null;
        event = tagEvent;
    }

    // call this before executing the killBrowser() command to avoid errors
    public static void stop() {
        proxy.stop();
    }

    // used for debugging
    public static void writeLog(String filename) throws IOException {
        // get the HAR data
        har = proxy.getHar();

        har.writeTo(new File(filename));

        proxy.newHar();
    }

    public static void writeLog() {
        try {
            writeLog("harlog.txt");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}