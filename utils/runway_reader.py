#import sys
import polars as pl

def searchRWY(icao, df):
    #sys.stdout.reconfigure(encoding="utf-8") Do not uncomment as it breaks packaged app using pyinstaller 
    runways = []

    result_df = df.filter(pl.col("airport_ident") == icao).select(["airport_ident", "le_ident", "he_ident"])
    runways_df = result_df.select(pl.col("le_ident"), pl.col("he_ident"))


    runways = runways + runways_df["le_ident"].to_list()
    runways = runways + runways_df["he_ident"].to_list()

    return runways

## Testing inputs
#df = pl.read_csv("runways.csv", infer_schema_length=None)
#icao = "CYYZ"
#searchRWY(icao, df)