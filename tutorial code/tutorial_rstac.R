install.packages("rstac")

library(rstac)

stac <- stac("http://localhost:5555/")

results <- stac %>%
  stac_search(bbox = c(-180, -90, 180, 90)) %>%
  get_request()
  
print(results$features)

