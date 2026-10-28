/**
 * Liveness check for uptime monitoring (Better Stack): answers whenever the
 * site's serverless functions run. Deliberately not logged, since it's polled
 * every few minutes.
 */
const Health = (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ status: 'ok', release: process.env.APP_RELEASE });
};

export default Health;
