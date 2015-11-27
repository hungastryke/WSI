import net.lightbody.bmp.BrowserMobProxy;
import net.lightbody.bmp.BrowserMobProxyServer;
import net.lightbody.bmp.client.ClientUtil;
import net.lightbody.bmp.core.har.Har;
import net.lightbody.bmp.core.har.HarEntry;
import net.lightbody.bmp.core.har.HarNameValuePair;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class PMCT {
    private static String reqUrlFragment;
    private static Har har;
    private static BrowserMobProxy proxy;

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
        public ArrayList<HarEntry> entryList;
        public String key;

        public void is(String val) {
            for (HarEntry entry : entryList) {
                List<HarNameValuePair> queryList = entry.getRequest().getQueryString();
                for (HarNameValuePair pair : queryList) {
                    if (Objects.equals(pair.getName(), key) && Objects.equals(pair.getValue(), val)) {
                        System.out.println("FOUND!");
                    }
                }
            }
        }
    }

    public static Expect expect(String key) {
        // get the HAR data
        har = proxy.getHar();

        List<HarEntry> entryList = har.getLog().getEntries();
        ArrayList<HarEntry> filteredList = new ArrayList<>();

        for (HarEntry entry : entryList) {
            if (entry.getRequest().getUrl().contains(reqUrlFragment)) {
                filteredList.add(entry);
            }
        }

        testCase.entryList = filteredList;
        testCase.key = key;
        return testCase;
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