fis-postpackager-ext-map
========================

fis-postpackager-ext-map

扩展map.json，记录组件名的hash，生成`ns`-data.json


### install 

```bash
npm install -g fis-postpackager-ext-map
```

### settings 

```javascript
fis.config.merge({
    modules: {
        postpackager: 'ext-map'
    },

    settings: {
        postpackager: {
            //如果需要产出data.json
            create: ['data.json']
        }
    }
});

```
