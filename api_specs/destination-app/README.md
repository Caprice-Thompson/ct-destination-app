# Destination App — Backstage (OpenAPI docs)

OpenAPI-only developer portal for the destination API.

```bash
yarn install
yarn start
```

- Edit spec: `examples/destination-app.openapi.yaml`
- Regenerate catalog entity: `yarn sync:openapi-catalog` (also runs automatically before `yarn start`)
- Catalog entities: `examples/destination-catalog.yaml`, `examples/org.yaml`

See [../README.md](../README.md).
