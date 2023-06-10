resource "google_cloud_run_v2_service" "mainapp" {
  name     = "mainapp"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    max_instance_request_concurrency = 80
    containers {
      image = "gcr.io/ejfexperiments/mainapp:v1.6"
      resources {
        limits = {
          # 512Mi
          memory = "2Gi"
          # '1', '2', '4', and '8' 1000m 250m 500m
          cpu = "1000m"
        }
      }
    }
    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }
  }
}

resource "google_cloud_run_service_iam_member" "run_all_users" {
  service  = google_cloud_run_v2_service.mainapp.name
  location = google_cloud_run_v2_service.mainapp.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "service_url" {
  value = google_cloud_run_v2_service.mainapp.traffic_statuses[0].uri
}
