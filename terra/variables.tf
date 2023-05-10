variable "project_name" {
  description = "Project name"
  type        = string
  default     = "ejfexperiments"
}

variable "firebase_project_id" {
  description = "Firebase Project Id"
  type        = string
  default     = "ejfexperiments"
}

# terraform apply -var environment="stg"
# terraform apply -var environment="pro"
variable "environment" {
  description = "Environment"
  type        = string
  default     = "pro"
}

variable "location" {
  description = "Location"
  type        = string
  default     = "us-central"
}

variable "region" {
  description = "Region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Zone"
  type        = string
  default     = "us-central1-c"
}

variable "service_acount_json" {
  description = "Service Account Json"
  type        = string
  default     = "/home/ejfdelgado/desarrollo/ejflab/llaves/ejfexperiments-c2ef2a890ca5.json"
}
