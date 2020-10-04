import pandas as pd

# checks if strings can be converted to floats
def is_number(str):
    try:
        float(str)
        return True
    except ValueError:
        return False

# read in unformatted data
dirty_data = pd.read_csv("./weather_stations_dirty.txt")
# prepare clean data frame
clean_data = pd.DataFrame(columns=["site", "name", "lat", "lng"])

# iterrate through each row of dirty data
for row in dirty_data.index:

    # split row into fragments
    broken_data = dirty_data.loc[row][0].split()

    # first fragment is station ID
    site = int(broken_data.pop(0))

    # create list to build station name
    name = [broken_data.pop(0)]

    # if next fragment is text, add it to station name
    while True:
        next = broken_data.pop(0)

        # if fragment is float, it's latitude
        if is_number(next):
            lat = float(next)
            break

        name.append(next)

    # convert station name to string
    name = " ".join(name)

    # last fragment we need is longitude
    lng = float(broken_data.pop(0))

    # build row of clean data
    new_row = {
        "site": site,
        "name": name,
        "lat": lat,
        "lng": lng
    }

    clean_data = clean_data.append(new_row, ignore_index=True)
    
 # save clean data to file
clean_data.to_csv("weather_stations.csv", index=False)

print("weather_stations.csv written")
