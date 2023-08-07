---
layout: default
title: Permissions and Connectivity
nav_order: 3
description: "Permissions and connectivity required to run SMT"
---

# Permissions & Connectivity
{: .no_toc }

- **Connectivty**: Since both Spanner migration tool and the underlying GCP services talk to the source database for schema and data migration, certain pre-requisite connectivity configurations are required before using the tool.
- **Permissions**: Spanner migration tool (SMT) runs in the customers GCP account. In order to orchestrate migrations, SMT needs access to certain permissions.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Connectivity

### API enablement

Ensure that Datastream and Dataflow apis are enabled on your project.

1. [Make sure that billing is enabled for your Google Cloud project](https://cloud.google.com/billing/docs/how-to/verify-billing-enabled#gcloud).
2. Follow the [Datastream guidelines](https://cloud.google.com/datastream/docs/use-the-datastream-api#enable_the_api) to enable Datasteream api.
3. Enable the Dataflow api by using:

   ```sh
   gcloud services enable dataflow.googleapis.com
   ```

4. Google Cloud Storage apis are generally enabled by [default](https://cloud.google.com/service-usage/docs/enabled-service#default). In they have been disabled, you will need to enable them.

   ```sh
   gcloud services enable storage.googleapis.com
   ```

### Configuring connectivity for `spanner-migration-tool`

In order for SMT to read the information schema from the source database, ensure that the machine where you run `spanner-migration-tool` is allowlisted to connect to the source database.
In generic terms (your specific network settings may differ), do the following:

1. Open your source database machine's network firewall rules.
2. Create an inbound rule.
3. Set the source ip address as the ip address of the machine where you run the `spanner-migration-tool`.
4. Set the protocol to TCP.
5. Set the port associated with the TCP protocol of your database.
6. Save the firewall rule, and then exit.

### Configure Datastream connectivity to source database

{: .highlight }
This is only needed for minimal downtime migrations via Spanner migration tool.

Follow the [Datastream guidelines](https://cloud.google.com/datastream/docs/network-connectivity-options) to allowlist datastream to access the source database.

- [IP allowlist](https://cloud.google.com/datastream/docs/network-connectivity-options#ipallowlists)
- [Forward SSH Tunneling](https://cloud.google.com/datastream/docs/network-connectivity-options#sshtunnel)
- [VPC Peering](https://cloud.google.com/datastream/docs/network-connectivity-options#privateconnectivity)

### Configure source database to enable CDC capture via Datastream

{: .highlight }
This is only needed for minimal downtime migrations via Spanner migration tool.

Even if the source database is reachable via Datastream, certain prerequisites
need to be performed on the source database before Datastream can streaming
backfill and CDC events from it. The steps required vary for each database.
Validate that the following steps have been performed on the source database
before using SMT.

- [MySQL](https://cloud.google.com/datastream/docs/configure-your-source-mysql-database)
- [Postgres](https://cloud.google.com/datastream/docs/configure-your-source-postgresql-database)
- [Oracle](https://cloud.google.com/datastream/docs/configure-your-source-oracle-database)

## Permissions

The Spanner migration tool interacts with many GCP services. Please refer to this list for persmissions required to perform migrations.

### Spanner

The recommended role to perform migrations is [Cloud Spanner Database Admin](https://cloud.google.com/spanner/docs/iam#spanner.databaseAdmin).

The full list of required [Spanner permissions](https://cloud.google.com/spanner/docs/iam) for migration are

```sh
spanner.instances.list
spanner.instances.get

spanner.databases.create
spanner.databases.list
spanner.databases.get
spanner.databases.getDdl
spanner.databases.updateDdl
spanner.databases.read
spanner.databases.write
spanner.databases.select
```

Refer to the [grant permissions page](https://cloud.google.com/spanner/docs/grant-permissions) for custom roles.

### Datastream

Follow [this guide](https://cloud.google.com/datastream/docs/use-the-datastream-api#permissions) to enable Datastream permissions.

### Dataflow

1. Enable [Dataflow Admin](https://cloud.google.com/dataflow/docs/concepts/access-control#dataflow.admin).
2. To use custom templates, enable [basic permissions](https://cloud.google.com/dataflow/docs/guides/templates/using-flex-templates#before_you_begin).

### GCE

Enable access to Datastream, Dataflow and Spanner using [service accounts](https://cloud.google.com/compute/docs/access/create-enable-service-accounts-for-instances).

### Other Permissions

In addition to these, the `DatastreamToSpanner` pipeline created by SMT requires
the following roles as well:

- Dataflow service account:
  - GCS Bucket Lister
  - Storage Object Creator
  - GCS Object Lister
  - Storage Object Viewer
- Dataflow compute engine service account:
  - Datastream Viewer role
  - Cloud Spanner Database user
  - Cloud Spanner Restore Admin
  - Cloud Spanner Viewer
  - Dataflow Worker