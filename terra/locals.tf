locals {
  timestamp       = formatdate("YYMMDDhhmmss", timestamp())
  service_account = "dev-600@ejfexperiments.iam.gserviceaccount.com"
}
