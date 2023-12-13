resource "google_compute_firewall" "firewall" {
  name    = "police-firewall-externalssh"
  network = "default"
  allow {
    protocol = "tcp"
    ports    = ["2220"]
  }
  allow {
    protocol = "udp"
    ports    = ["8081"]
  }
  allow {
    protocol = "tcp"
    ports    = ["8081"]
  }
  source_ranges = ["0.0.0.0/0"] # Not So Secure. Limit the Source Range
  target_tags   = ["externalsshhttp"]
}

resource "google_compute_address" "static" {
  name = "police-public-address"
  project = var.project_name
  region = var.region
  depends_on = [ google_compute_firewall.firewall ]
}

# resource "google_service_account" "default" {
#   account_id   = "my-custom-sa"
#   display_name = "Custom SA for VM Instance"
# }

# resource "google_compute_instance" "default" {
#   name         = "my-instance"
#   machine_type = "n1-standard-1"
#   zone         = var.zone
#   tags         = ["externalsshhttp"]
#   boot_disk {
#     initialize_params {
#       image = "gcr.io/ejfexperiments/policiavr:v1.82"
#     }
#   }

#   // Local SSD disk
#   scratch_disk {
#     interface = "NVME"
#   }

#   network_interface {
#     network = "default"

#     access_config {
#       // Ephemeral public IP
#       nat_ip = google_compute_address.static.address
#     }
#   }

#   metadata_startup_script = "echo hi > /test.txt"

#   service_account {
#     email  = google_service_account.default.email
#     scopes = ["cloud-platform"]
#   }
# }

# resource "google_cloud_run_v2_service" "policiavr" {
#   name     = "policiavr"
#   location = var.region
#   ingress  = "INGRESS_TRAFFIC_ALL"
#   template {
#     max_instance_request_concurrency = 80
#     containers {
#       image = "gcr.io/ejfexperiments/policiavr:v1.82"
#       resources {
#         limits = {
#           # 512Mi
#           memory = "4Gi"
#           # '1', '2', '4', and '8' 1000m 250m 500m
#           cpu = "1000m"
#         }
#       }
#     }
#     scaling {
#       min_instance_count = 0
#       max_instance_count = 1
#     }
#   }
# }

# resource "google_cloud_run_service_iam_member" "run_all_users" {
#   service  = google_cloud_run_v2_service.policiavr.name
#   location = google_cloud_run_v2_service.policiavr.location
#   role     = "roles/run.invoker"
#   member   = "allUsers"
#   depends_on = [
#     google_cloud_run_v2_service.policiavr
#   ]
# }

# output "service_url" {
#   description = "Address"
#   value       = google_cloud_run_v2_service.policiavr.traffic_statuses[0].uri
# }
