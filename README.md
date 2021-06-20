# useAsynkResource

## Example

```tsx
import { useAsyncResource } from "use-asynk-resource";
import { Suspense } from "react";

const App = () => {
  const userResource = useAsyncResource(() => loadUser(...));

  return (
    <Suspense fallback={<>loading...</>}>
      <User resource={userResource} />
    </Suspense>
  )
};

const Resource = ({ resource }) => {
  const user = resource.read()

  return <div>{user.displayName}</div>
}
```

## Installation

```cmd
# npm
npm i use-async-resource

# yarn
yarn add use-async-resource
```
