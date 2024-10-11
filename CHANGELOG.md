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
* [UISAUTHCOM-9](https://folio-org.atlassian.net/browse/UISAUTHCOM-9) Conditionally set values of selected capabilities/sets to true if checked and remove from object if NOT.
* [UISAUTHCOM-11](https://folio-org.atlassian.net/browse/UISAUTHCOM-11) Move reusable components from `ui-authorization-policies` repository.
* [UISAUTHCOM-13](https://folio-org.atlassian.net/browse/UISAUTHCOM-13) Cleanup only capabilities related queries from react-query cache on close edit role.
* [UISAUTHCOM-12](https://folio-org.atlassian.net/browse/UISAUTHCOM-12) Ensure support for the passed `tenantId` value for manipulations in the context of a specific tenant.
* [UISAUTHCOM-17](https://folio-org.atlassian.net/browse/UISAUTHCOM-17) Create reusable components for editing, saving Authorization policies for the consortium.
* [UISAUTHCOM-15](https://folio-org.atlassian.net/browse/UISAUTHCOM-15) Check if user exists in Keycloak on assign users to role. If not show confirmation dialog to create user records in Keycloak.
* [UISAUTHCOM-18](https://folio-org.atlassian.net/browse/UISAUTHCOM-18) Add button to unassign all assigned capabilities/sets when editing an authorization role in RoleForm. 
* [UISAUTHCOM-19](https://folio-org.atlassian.net/browse/UISAUTHCOM-19) Create reusable hooks and components for duplicate authorization role.
* [UISAUTHCOM-22](https://folio-org.atlassian.net/browse/UISAUTHCOM-22) Move "Select application" button to the top of the role form
* [UISAUTHCOM-14](https://folio-org.atlassian.net/browse/UISAUTHCOM-14) ECS - Support sharing of authorization roles and policies.
* [UISAUTHCOM-20](https://folio-org.atlassian.net/browse/UISAUTHCOM-20) ECS - Prevent editing of shared Role from outside "Consortium manager".
* [UISAUTHCOM-21](https://folio-org.atlassian.net/browse/UISAUTHCOM-21) ECS - Prevent editing of shared Policies from outside "Consortium manager".
* [UISAUTHCOM-23](https://folio-org.atlassian.net/browse/UISAUTHCOM-23) Display toast message for saving and editing authorization roles.
* [UISAUTHCOM-16](https://folio-org.atlassian.net/browse/UISAUTHCOM-16) Provide maxHeight to the capabilities tables.
* [UISAUTHCOM-25](https://folio-org.atlassian.net/browse/UISAUTHCOM-25) Update user capability hooks.
* [UISAUTHCOM-24](https://folio-org.atlassian.net/browse/UISAUTHCOM-24) Hide "edit" and "share" actions for policies.
