locals {
  timestamp       = formatdate("YYMMDDhhmmss", timestamp())
  service_account = "ejfexperiments@appspot.gserviceaccount.com"
}
