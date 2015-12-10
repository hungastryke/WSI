from helium.api import *
from pmct import Pmct

import time

domain = "integration.williams-sonoma.com"
auth = "http://wsqauser:SupC00k$@"
defaultBrowser = "Firefox"
test = Pmct()


def check_for_overlay():
    time.sleep(2)
    while S(".overlayCloseButton").exists():
        click(S(".overlayCloseButton"))
        time.sleep(3)


# Navigate to category page, hover over item and click quick look
def case1():
    test.new_case("CASE 1")
    test.watch_for("event41")
    go_to(auth + "integration.potterybarnkids.com/shop/bedding/girls-duvet-covers/?")
    check_for_overlay()
    click(S(".quicklook-link"))
    wait_until(S("#overlay-content").exists)
    test.expect("products").equals(";chinoiserie-duvet-cover-bright-pink")
    test.expect("events").contains("prodView")


# PIP Pages
def case2():
    test.new_case("CASE 2")
    test.watch_for("event18")
    go_to(auth + "williams-sonoma.com/products/nesmuk-janus-slicer/?pkey=ccutlery-slicers||&cm_src=Quickbuy&sku=9988705&qty=1")
    check_for_overlay()
    test.expect("events").contains("prodView")
    test.expect("products").contains("nesmuk-janus-slicer")


# PIP Pages w/ secondary item
def case3():
    test.new_case("CASE 3")
    test.watch_for("event19")
    go_to(auth + "potterybarnkids.com/products/harper-chevron-pop-of-color-crib-fitted-sheet-boy/?pkey=bboys-nursery-sheeting%7C%7C&group=1&sku=6378517")
    check_for_overlay()
    test.expect("products").equals(";harper-chevron-pop-of-color-crib-fitted-sheet-boy;;;event18=1,;boys-harper-nursery-bedding;;;event19=1")


# On Load of product personalization
def case4():
    test.new_case("CASE 4")
    test.watch_for("event49")
    go_to(auth + "williams-sonoma.com/shoppingcart/177819589008/monogram.html")
    check_for_overlay()
    test.expect("products").equals(";shun-classic-hollow-ground-5in-santoku-knife")


# Personalizations applied to product
def case5():
    test.new_case("CASE 5")
    test.watch_for("event50")
    go_to(auth + "williams-sonoma.com/products/shun-classic-hollow-ground-5in-santoku-knife/?transid=177819589008&pkey=ccutlery-santoku-knives%7C%7C&cm_src=E:cutlery-santoku-knives")
    check_for_overlay()
    click(S("@addMono"))
    click("Add to Cart")
    test.expect("products").equals(";shun-classic-hollow-ground-5in-santoku-knife;;;event11=1|event69=1|event12=139.95|event70=139.95;eVar33=7772841")


# Add Product to registry
def case6():
    test.new_case("CASE 6")
    test.watch_for("event16")
    go_to(auth + "williams-sonoma.com/products/shun-classic-hollow-ground-5in-santoku-knife/?transid=177819589008&pkey=ccutlery-santoku-knives%7C%7C&cm_src=E:cutlery-santoku-knives")
    check_for_overlay()
    click("Add To Registry")
    test.expect("v34").exists()
    test.expect("products").equals(";shun-classic-hollow-ground-5in-santoku-knife;;;;eVar33=7772841")


# Add product to wishlist
def case7():
    test.new_case("CASE 7")
    test.watch_for("event16")
    go_to(auth + "pbteen.com/products/rise-and-shine-alarm-clock/?pkey=cclocks-phones&&cclocks-phones")
    check_for_overlay()
    click("Plum")
    write("1", into="QTY")
    click("Add To Wishlist")
    test.expect("v35").exists()
    test.expect("products").equals(";rise-and-shine-alarm-clock;;;;eVar33=895870")


# Add any product to shopping cart
def case8():
    test.new_case("CASE 8")
    test.watch_for("scAdd")
    go_to(auth + domain + "/products/all-clad-d5-stainless-steel-10-piece-cookware-set/?pkey=ccookware-sets%7C%7C")
    check_for_overlay()
    click("Add to Cart")
    wait_until(S("#anchor-btn-checkout").exists)
    test.expect("products").exists()


# Increase/Decrease products in cart
# NOTE: requires case8 to run first!
def case9():
    test.new_case("CASE 9")
    test.watch_for("scAdd")
    check_for_overlay()
    click(S(".view-cart"))
    write("2", into="Quantity")
    click(S("@recalculate"))
    test.expect("products").exists()

    test.watch_for("scRemove")
    write("0", into="Quantity")
    click(S("@recalculate"))
    test.expect("products").exists()


def case_purchase_funnel():
    test.watch_for("event18")
    go_to(auth + domain + "/products/all-clad-d5-stainless-steel-10-piece-cookware-set/?pkey=ccookware-sets%7C%7C")
    check_for_overlay()
    test.expect("events").exists()
    test.expect("v24").equals("First Visit")
    test.expect("v41").contains("ALL-CLAD D5 STAINLESS-STEEL 10-PIECE COOKWARE SET")

    test.watch_for("scCheckout")
    click("Add to Cart")
    click("Checkout")
    click(S("input.rollover.checkoutButton"))
    click(S("#continueAsGuest"))
    test.expect("v41").equals("ACCOUNT: CHECKOUT SIGN IN")


if __name__ == '__main__':
    driver = test.get_driver(defaultBrowser, "/b/ss/")
    set_driver(driver)
    # case1()
    case2()
    case3()
    case4()
    # case5()
    # case6()
    # case7()
    # case8()
    # case9()
    # case_purchase_funnel()
    test.report()
    kill_browser()
