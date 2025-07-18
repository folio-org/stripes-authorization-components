# Change history for stripes-authorization-components

# [2.1.0] In Progress

* [UISAUTHCOM-60](https://folio-org.atlassian.net/browse/UISAUTHCOM-60) Add new `hideUserLink` prop to `RoleDetails` component that will display users in assigned users list as a text if enabled.
* [UISAUTHCOM-59](https://folio-org.atlassian.net/browse/UISAUTHCOM-59) Increase request timeout in `useCreateRoleMutation`, `useEditRoleMutation` from default 30 seconds to 10 minutes. This can be decreased if back-end performance improves.
* [UISAUTHCOM-65](https://folio-org.atlassian.net/browse/UISAUTHCOM-65) Provide the ability to pass props to control whether certain actions can be performed.

# [2.0.2](https://github.com/folio-org/stripes-authorization-components/tree/v2.0.2)

* [UISAUTHCOM-51](https://folio-org.atlassian.net/browse/UISAUTHCOM-51) Provide `expand=false` parameter to `useRoleCapabilities` that used in `useInitalRoleSharing` to correctly retrieve directly assigned capabilities

# [2.0.1](https://github.com/folio-org/stripes-authorization-components/tree/v2.0.1) (2025-04-09)

* [UISAUTHCOM-55](https://folio-org.atlassian.net/browse/UISAUTHCOM-55) Filter out any capabilities with property `dummyCapability = true` since they are invalid. API will suppress once MODROLESKC-285 is completed, but this immediately fixes the issue in the UI.

# [2.0.0](https://github.com/folio-org/stripes-authorization-components/tree/v2.0.0) (2025-03-13)

* *BREAKING* [UISAUTHCOM-46](https://folio-org.atlassian.net/browse/UISAUTHCOM-46) migrate react-intl to v7.
* *BREAKING* [UISAUTHCOM-50](https://folio-org.atlassian.net/browse/UISAUTHCOM-50) migrate stripes dependencies to their Sunflower versions.

## 1.1.0

* [UISAUTHCOM-44](https://folio-org.atlassian.net/browse/UISAUTHCOM-44) Add Deque Axe a11y tests.
* [UISAUTHCOM-47](https://folio-org.atlassian.net/browse/UISAUTHCOM-47) Retry get publication details request for `404` response status.
* [UISAUTHCOM-49](https://folio-org.atlassian.net/browse/UISAUTHCOM-49) put regular role type when duplicating.
* [UISAUTHCOM-52](https://folio-org.atlassian.net/browse/UISAUTHCOM-52) - fix `capabilitiesToCompare` to address issue with capabilities from both comparing roles are highlighted.

## [1.0.1](https://github.com/folio-org/stripes-authorization-components/tree/v1.0.1) (2024-11-08)
[Full Changelog](https://github.com/folio-org/stripes-acq-components/compare/v1.0.0...v1.0.1)

* [UISAUTHCOM-36](https://folio-org.atlassian.net/browse/UISAUTHCOM-36) Avoid extra capability requests for role sharing when not in central tenant
* [UISAUTHCOM-37](https://folio-org.atlassian.net/browse/UISAUTHCOM-37) ECS - Add Tenant identifier to title of Select user modal.
* [UISAUTHCOM-38](https://folio-org.atlassian.net/browse/UISAUTHCOM-38) Include "create" and "delete" actions in "settings" capability/capabilitySet accordions
* [UISAUTHCOM-39](https://folio-org.atlassian.net/browse/UISAUTHCOM-39) Enforce new "manage" permission set and hide action menu if no actions are available.
* [UISAUTHCOM-40](https://folio-org.atlassian.net/browse/UISAUTHCOM-40) Add ability to select entire columns of capabilities in each capability/capabilitySet grid/accordion.
* [UISAUTHCOM-41](https://folio-org.atlassian.net/browse/UISAUTHCOM-41) Fix disabled the issue with capabilities included in capability set are not deselected when deselecting a set.
* [UISAUTHCOM-42](https://folio-org.atlassian.net/browse/UISAUTHCOM-42) Disable hyperlinks for user names in role details page if user doesn't have access to Users module.
* [UISAUTHCOM-43](https://folio-org.atlassian.net/browse/UISAUTHCOM-43) Fix capabilities from unselected application sometimes shown as assigned for a role after editing.

## [1.0.0](https://github.com/folio-org/stripes-authorization-components/tree/v1.0.0) (2024-11-01)

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
* [UISAUTHCOM-8](https://folio-org.atlassian.net/browse/UISAUTHCOM-8) Add hooks for fetching users capabilities.
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
* [UISAUTHCOM-27](https://folio-org.atlassian.net/browse/UISAUTHCOM-27) - Fix premature confirmation dialog appearance by putting Loading, MCL, ConfirmationDialog into accordion body.
* [UISAUTHCOM-28](https://folio-org.atlassian.net/browse/UISAUTHCOM-28) - Cleanup capabilities/sets data from query cache on RoleCreate.
* [UISAUTHCOM-29](https://folio-org.atlassian.net/browse/UISAUTHCOM-29) Protect mutation actions of roles by permissions.
