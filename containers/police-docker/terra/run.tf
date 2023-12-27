# resource "google_compute_firewall" "firewall" {
#   name    = "police-firewall-externalssh"
#   network = "default"
#   allow {
#     protocol = "tcp"
#     ports    = ["2220"]
#   }
#   allow {
#     protocol = "udp"
#     ports    = ["8081"]
#   }
#   allow {
#     protocol = "tcp"
#     ports    = ["8081"]
#   }
#   source_ranges = ["0.0.0.0/0"] # Not So Secure. Limit the Source Range
#   target_tags   = ["externalsshhttp"]
# }

# resource "google_compute_address" "static" {
#   name       = "police-public-address"
#   project    = var.project_name
#   region     = var.region
#   depends_on = [google_compute_firewall.firewall]
# }

# resource "google_compute_instance" "police-server-dev" {
#   boot_disk {
#     auto_delete = true
#     device_name = "police-server-dev"

#     initialize_params {
#       image = "projects/cos-cloud/global/images/cos-101-17162-336-28"
#       size  = 10
#       type  = "pd-standard"
#     }

#     mode = "READ_WRITE"
#   }

#   can_ip_forward      = false
#   deletion_protection = false
#   enable_display      = false

#   labels = {
#     container-vm = "cos-stable-109-17800-66-32"
#     goog-ec-src  = "vm_add-tf"
#   }

#   machine_type = "e2-medium"

#   metadata = {
#     gce-container-declaration = "spec:\n  containers:\n  - name: police-server-dev\n    image: gcr.io/ejfexperiments/policiavr:v1.82\n    stdin: false\n    tty: false\n  restartPolicy: Always\n# This container declaration format is not public API and may change without notice. Please\n# use gcloud command-line tool or Google Cloud Console to run Containers on Google Compute Engine."
#   }

#   name = "police-server-dev"

#   network_interface {
#     access_config {
#       nat_ip = google_compute_address.static.address
#     }

#     subnetwork = "projects/ejfexperiments/regions/us-central1/subnetworks/default"
#   }

#   scheduling {
#     automatic_restart   = true
#     on_host_maintenance = "MIGRATE"
#     preemptible         = false
#     provisioning_model  = "STANDARD"
#   }

#   service_account {
#     email  = "1066977671859-compute@developer.gserviceaccount.com"
#     scopes = ["https://www.googleapis.com/auth/devstorage.read_only", "https://www.googleapis.com/auth/logging.write", "https://www.googleapis.com/auth/monitoring.write", "https://www.googleapis.com/auth/service.management.readonly", "https://www.googleapis.com/auth/servicecontrol", "https://www.googleapis.com/auth/trace.append"]
#   }

#   shielded_instance_config {
#     enable_integrity_monitoring = true
#     enable_secure_boot          = false
#     enable_vtpm                 = true
#   }

#   tags = ["externalsshhttp"]
#   zone = var.zone
# }


# resource "google_compute_instance_from_machine_image" "police_node" {
#   provider     = google-beta
#   name         = "police-server"
#   zone         = var.zone
#   machine_type = "n1-standard-1"

#   source_machine_image = "ejfexperiments/policiavr"

#   // Override fields from machine image
#   can_ip_forward = false

#   tags = ["externalsshhttp"]

#   depends_on = [google_compute_firewall.firewall, google_compute_address.static]

#   network_interface {
#     network = "default"

#     access_config {
#       // Ephemeral public IP
#       nat_ip = google_compute_address.static.address
#     }
#   }
# }

# resource "google_service_account" "default" {
#   account_id   = "my-custom-sa"
#   display_name = "Custom SA for VM Instance"
# }

# resource "google_compute_instance" "police_node" {
#   name         = "police_node"
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

#   depends_on = [ google_compute_firewall.firewall ]
# }

resource "google_cloud_run_v2_service" "policiavr" {
  name     = "policiavr"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"
  template {
    max_instance_request_concurrency = 80
    containers {
      image = "gcr.io/ejfexperiments/policiavr:v1.87"
      resources {
        limits = {
          # 512Mi
          memory = "4Gi"
          # '1', '2', '4', and '8' 1000m 250m 500m
          cpu = "1000m"
        }
      }
    }
    scaling {
      min_instance_count = 0
      max_instance_count = 1
    }
  }
}

# resource "google_cloud_run_service_iam_member" "run_all_users" {
#   service  = google_cloud_run_v2_service.policiavr.name
#   location = google_cloud_run_v2_service.policiavr.location
#   role     = "roles/run.invoker"
#   member   = "allUsers"
#   depends_on = [
#     google_cloud_run_v2_service.policiavr
#   ]
# }

