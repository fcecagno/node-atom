/*
 Documentation coming soon.
*/

var XML        = require('xml'),
    log        = require('logging').from(__filename),
    crypto     = require('crypto');

function ATOM (options, items) {
    options = options || {};

    this.title          = options.title || 'Untitled ATOM Feed';
    this.description    = options.description || '';
    this.feed_url       = options.feed_url;
    this.site_url       = options.site_url;
    this.hub_url        = options.hub_url;
    this.image_url      = options.image_url || '';
    this.author         = options.author;
    this.items          = items || [];

    this.item = function (options) {
        options = options || {};
        var item = {
            title:          options.title || 'No title',
            description:    options.description || '',
            url:            options.url,
            guid:           options.guid,
            categories:     options.categories || [],
            author:         options.author,
            updated:        options.updated
        };

        this.items.push(item);
        return this;
    };

    this.xml = function(indent) {
        return '<?xml version="1.0" encoding="UTF-8"?>\n'
                + XML(generateXML(this), indent);
    }

}

function uniqid() {
    var newDate = new Date;
    return newDate.getTime();
}

function uuid (key, prefix) {
    prefix = prefix || '';

    key = (key === null) ? "" + uniqid() : key;
    var hash = crypto.createHash('md5');
    hash.update(key);
    var chars = hash.digest('hex').toString();
    var uuid  = chars.substr(0,8) + '-';
    uuid += chars.substr(8,4) + '-';
    uuid += chars.substr(12,4) + '-';
    uuid += chars.substr(16,4) + '-';
    uuid += chars.substr(20,12);

    return prefix + uuid;
}

function ifTruePush(bool, array, data) {
    if (bool !== null && bool !== undefined) {
        array.push(data);
    }
}

function generateXML (data){

    var feed =  [
            { _attr: {
                'xmlns':         'http://www.w3.org/2005/Atom',
                'xml:lang':      'en-US'
            } },
            { id:           uuid(data.feed_url, 'urn:uuid:') },
            { link:         { _attr: { type: 'text/html', rel: 'alternate', href: data.site_url } } },
            { link:         { _attr: { type: 'application/atom+xml', rel: 'self', href: data.feed_url } } },
            { title:        data.title },
            { updated:      new Date().toISOString() },
            { icon:         data.image_url }
        ];

    if (data.hub_url !== undefined)
        feed.push({ link: { _attr: { type: 'text/html', rel: 'hub', href: data.hub_url } } });

    data.items.forEach(function(item) {
        var entry = [
                    { id:        uuid(item.title, 'urn:uuid:') }
                ];
        ifTruePush(item.updated,     entry, { updated:      new Date(item.updated).toISOString() });
        ifTruePush(item.url,         entry, { link:         { _attr: { type: 'text/html', rel: 'alternate', href: item.url } } });
        ifTruePush(item.title,       entry, { title:        item.title });
        ifTruePush(item.description, entry, { content:  { _attr: { type: 'html', 'xml:lang': 'en' }, _cdata: item.description } });
        ifTruePush(item.author,      entry, { author:       [ { name: item.author } ] });

        feed.push({ entry: entry });
    });

    return { feed: feed };
}



module.exports = ATOM;
