{%html framework="extmap:static/mod-store.js"%}
    {%head%}
        <title>This is a test</title>
    {%/head%}
    {%body%}
        {%script%}
            require.async('/widget/a.js');
            require.async('/widget/b.js');
        {%/script%}
    {%/body%}
{%/html%}
