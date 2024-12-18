
//clean url
function cleanURL(rules, url, recurseRedir = true) {
    // Clean the given URL using the loaded rules data.
    // Loop through all the providers in the rules
    for (const provider of Object.values(rules.providers || {})) {
        const urlPattern = new RegExp(provider.urlPattern, 'i');  // Case-insensitive regex
        if (!urlPattern.test(url)) {
            continue;  // Skip if URL doesn't match the provider pattern
        }
        // If any exceptions are matched, this provider is skipped
        const hasException = provider.exceptions?.some((exc) => new RegExp(exc, 'i').test(url));
        if (hasException) {
            continue;
        }
        // Check for redirections
        for (const redir of provider.redirections || []) {
            const match = new RegExp(redir, 'i').exec(url);
            if (match && match[1] && match[1] !== url) {
                url = decodeURIComponent(match[1]);
                // If redirect is found, recurse on the target URL
                if (recurseRedir) {
                    url = cleanUrl(rules, url, true);
                }
                return url;  // Return the cleaned URL
            }
        }
        // Handle query parameters and filter based on rules
        const parsedUrl = new URL(url);
        let queryParams = Array.from(parsedUrl.searchParams.entries());
        for (const rule of [...provider.rules || [], ...provider.referralMarketing || []]) {
            queryParams = queryParams.filter(([key]) => !new RegExp(rule, 'i').test(key));
        }
        // Rebuild the URL without the excluded query parameters
        parsedUrl.search = new URLSearchParams(queryParams).toString();
        url = parsedUrl.toString();
        // Apply raw rules (regular expressions)
        for (const rawRule of provider.rawRules || []) {
            url = url.replace(new RegExp(rawRule, 'g'), '');
            console.log(rawRule);  // Print the rule for debugging
        }
    }
    return url
}

//get rules
rules = {}
fetch('./data.minify.json')
    .then((response) => response.json())
    .then((json) => rules = json);


function clean() {
    const url = new URL(window.location);

    // Create a URLSearchParams object from the query string
    const queryParams = new URLSearchParams(url.search);
    console.log(queryParams)
    if (queryParams.get('url')) {
        cleaned = cleanURL(rules, queryParams.get('url'));
        document.getElementById("output").innerHTML = cleaned;
        document.getElementById("output").innerHTML += navigator.permissions.Array
        navigator.clipboard.writeText(cleaned).then(() => {
            document.getElementById("output").innerHTML += ('Content copied to clipboard');
            /* Resolved - text copied to clipboard successfully */
          },() => {
            document.getElementById("output").innerHTML += ('Failed to copy');
            /* Rejected - text failed to copy to the clipboard */
          });
          
    } else (console.error("no params"))
}