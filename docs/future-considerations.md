# Future Considerations

Items the original concept mentioned that we are **deliberately not building
in Phase 1**. Listed here so the idea isn't lost.

## Imaging integrations

- **DICOM** ingestion and viewer for MRI/CT/x-ray.
- **MONAI** for automated segmentation (cartilage, joint space, edema).
- **OpenSim** for musculoskeletal simulation (muscle activation, joint loads).
- **FEBio** for soft-tissue finite element analysis (cartilage stress, ligament strain).

These are real tools that will matter in Phase 3+. Today we just store file
metadata and a pointer to the binary in object storage.

## Similarity / vector search

- `pgvector` for embedding-based similar-patient matching.
- We have an `embedText` stub in `@amis-dt/ai`. The vector column on
  `patient_profiles` will be added in a future migration.

## Real-time

- Live streaming of mobile sensor data (IMU, gait) into the twin.
- Supabase Realtime channels for clinician ↔ patient alerts.

## 3D / AR

- React Three Fiber for the web twin viewer.
- ARKit / ARCore passthrough for patient self-coaching at home.

## Wearables

- Apple HealthKit, Google Fit, Garmin, Whoop ingestion.
- Continuous mobility + adherence signals.
