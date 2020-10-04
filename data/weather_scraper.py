import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select

# use a headless browser (saves time)
chrome_options = Options()
chrome_options.add_argument("--headless")

# set up the broweser
driver = webdriver.Chrome(options=chrome_options)

# BOM climate data home page
driver.get("http://www.bom.gov.au/climate/data/")

# read in weather stations
station_data = pd.read_csv("weather_stations.csv")
stations = station_data["site"]

# prepare for scraping
Select(driver.find_element_by_name("ncc_obs_code_group")).select_by_value("4")
window_before = driver.window_handles[0]
select_station = driver.find_element_by_name("p_stn_num")

# empty list to capture solar scraped solar data
solar_exposure = []

# scraping loop
for station in stations:

    # clear the input field and replace with new station
    select_station.clear()
    select_station.send_keys(str(station), Keys.RETURN)

    # switch to the new window that popped up
    window_after = driver.window_handles[1]
    driver.switch_to.window(window_after)

    # attempt to read solar data and add to list; otherwise add null value
    try:
        driver.find_element_by_id("monthlyLink").click()
        exposure = driver.find_element_by_css_selector("#statsTable tr:nth-child(2) td:last-child").get_attribute("innerText")
        solar_exposure.append(exposure)
    except:
        solar_exposure.append("NaN")

    # close all but the first window
    for window in driver.window_handles[1:]:
        driver.switch_to.window(window)
        driver.close()
    driver.switch_to.window(window_before)

# end scraping, add solar exposure to stations and save
driver.close()
station_data["solar_exposure"] = solar_exposure
station_data.dropna(inplace=True)
station_data.to_csv("station_solar_data.csv", index=False)
