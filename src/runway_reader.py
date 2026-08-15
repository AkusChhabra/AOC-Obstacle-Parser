import polars as pl

df = pl.read_csv("runways.csv", infer_schema_length=10000)

icao = df.get_column("airport_ident")

print(icao)
