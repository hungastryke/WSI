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
    private static String reqUrlFragment;
    private static Har har;
    private static BrowserMobProxy proxy;
    private static String event;
    private static HashMap<String, String> queryPairs;

    public enum browserType {
        CHROME,
        FIREFOX,
        IE
    }
    public static Expect testCase = new Expect();

    public static WebDriver start(browserType browser) {
        // start the proxy
        proxy = new BrowserMobProxyServer();
        proxy.start(0);

        // get the Selenium proxy object
        Proxy seleniumProxy = ClientUtil.createSeleniumProxy(proxy);

        // configure it as a desired capability
        DesiredCapabilities capabilities = new DesiredCapabilities();
        capabilities.setCapability(CapabilityType.PROXY, seleniumProxy);

        WebDriver driver;

        if (browser == browserType.CHROME) {
            driver = new ChromeDriver(capabilities);
        } else if (browser == browserType.FIREFOX) {
            driver = new FirefoxDriver(capabilities);
        } else if (browser == browserType.IE) {
            driver = new InternetExplorerDriver(capabilities);
        } else {
            driver = new FirefoxDriver(capabilities);
        }

        proxy.newHar();

        return driver;
    }

    public static void setReqUrl(String urlFragment) {
        reqUrlFragment = urlFragment;
    }

    public static class Expect {
        public String key;

        public void is(String val) {
            String foundValue;

            if (queryPairs.containsKey(key)) {
                foundValue = queryPairs.get(key);
                if (Objects.equals(val, foundValue)) {
                    System.out.println("Pass: '" + key + "' is '" + val);
                } else {
                    System.out.println("FAIL: Expected '" + key + "' to be '" + val + "', was '" + foundValue + "' instead!");
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
            har = proxy.getHar();

            List<HarEntry> entryList = har.getLog().getEntries();

            for (HarEntry entry : entryList) {
                HarRequest req = entry.getRequest();
                if (req.getUrl().contains(reqUrlFragment)) {
                    queryPairs = new HashMap<>();

                    //create hashmap of querystring params to search through later
                    for (HarNameValuePair pair : req.getQueryString()) {
                        queryPairs.put(pair.getName(), pair.getValue());
                    }

                    break;
                }
            }

            //check if the event we're looking for is in the request, warn if not
            try {
                Set<String> eventSet = new HashSet<String>(Arrays.asList(queryPairs.get("events").split(",")));

                if (!eventSet.contains(event)) {
                    System.out.println("WARNING: event '" + event + "' not found!");
                }
            } catch (Exception e) {
                System.out.println("ERROR: No requests found with url fragment '" + reqUrlFragment + "'!");
                throw e;
            }
        }

        testCase.key = key;
        return testCase;
    }

    public static void watchFor(String e) {
        System.out.println("Watching for " + e + "...");
        har = null;
        proxy.newHar();
        event = e;
    }

    public static void stop() {
        proxy.stop();
    }

    public static void writeLog() throws IOException {
        // get the HAR data
        har = proxy.getHar();

        har.writeTo(new File("harlog.txt"));
    }
}