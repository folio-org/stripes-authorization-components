# Change history for stripes-authorization-components

## 1.0.0 (IN PROGRESS)

* [UISAUTHCOM-2](https://folio-org.atlassian.net/browse/UISAUTHCOM-2) Move component CapabilitiesSection from
  ui-authorization-roles.
* [UISAUTHCOM-5](https://folio-org.atlassian.net/browse/UISAUTHCOM-5) Add formatter to highlight unique values in
  CapabilitySection.
* [UISAUTHCOM-1](https://folio-org.atlassian.net/browse/UISAUTHCOM-1) Move reusable components from UIROLES to a shared
  repository.
* [UISAUTHCOM-6](https://folio-org.atlassian.net/browse/UISAUTHCOM-6) Add `expand` parameter to queryKey in
  useRoleCapabilities hook.
* [UISAUTHCOM-7](https://folio-org.atlassian.net/browse/UISAUTHCOM-7) Fix definition and calls to
  useRoleCapabilities/useRoleCapabilitySets so correct value is used for X-Okapi-Tenant.
* [UISAUTHCOM-10](https://folio-org.atlassian.net/browse/UISAUTHCOM-10) Clean up query cache on close edit role mode.
* [UISAUTHCOM-9](https://folio-org.atlassian.net/browse/UISAUTHCOM-9) Conditionally set values of selected
  capabilities/sets to true if checked and remove from object if NOT.
* [UISAUTHCOM-11](https://folio-org.atlassian.net/browse/UISAUTHCOM-11) Move reusable components from
  `ui-authorization-policies` repository.
* [UISAUTHCOM-13](https://folio-org.atlassian.net/browse/UISAUTHCOM-13) Cleanup only capabilities related queries from
  react-query cache on close edit role.
* [UISAUTHCOM-12](https://folio-org.atlassian.net/browse/UISAUTHCOM-12) Ensure support for the passed `tenantId` value
  for manipulations in the context of a specific tenant.
* [UISAUTHCOM-17](https://folio-org.atlassian.net/browse/UISAUTHCOM-17) Create reusable components for editing, saving
  Authorization policies for the consortium.
* [UISAUTHCOM-15](https://folio-org.atlassian.net/browse/UISAUTHCOM-15) Check if user exists in Keycloak on assign users
  to role. If not show confirmation dialog to create user records in Keycloak.
* [UISAUTHCOM-18](https://folio-org.atlassian.net/browse/UISAUTHCOM-18) Add button to unassign all assigned
  capabilities/sets when editing an authorization role in RoleForm.
* [UISAUTHCOM-22](https://folio-org.atlassian.net/browse/UISAUTHCOM-22) Move "Select application" button to the top of
  the role form
