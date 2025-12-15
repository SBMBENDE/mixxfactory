/**
 * Newsletter Demo Page
 * Showcases English and French newsletter variations
 */

import Newsletter from '@/components/Newsletter';

export const metadata = {
  title: 'Newsletter - English & French',
  description: 'Newsletter component in English and French with multiple design variants',
};

export default function NewsletterDemo() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <section className="px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Newsletter Component
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Beautiful, responsive newsletter signup with English and French support
        </p>
      </section>

      {/* English Variants */}
      <section className="px-4 py-12 md:py-20 max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            English Versions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Explore different design variants with English text
          </p>

          {/* Default Variant */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Default Variant
            </h3>
            <Newsletter variant="default" language="en" />
          </div>

          {/* Dark Variant */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Dark Variant
            </h3>
            <Newsletter variant="dark" language="en" />
          </div>

          {/* Gradient Variant */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Gradient Variant
            </h3>
            <Newsletter variant="gradient" language="en" />
          </div>
        </div>
      </section>

      {/* French Variants */}
      <section className="px-4 py-12 md:py-20 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              French Versions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Same beautiful design with French translations
            </p>

            {/* Default Variant */}
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Variante par défaut
              </h3>
              <Newsletter variant="default" language="fr" />
            </div>

            {/* Dark Variant */}
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Variante sombre
              </h3>
              <Newsletter variant="dark" language="fr" />
            </div>

            {/* Gradient Variant */}
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Variante dégradé
              </h3>
              <Newsletter variant="gradient" language="fr" />
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples Section */}
      <section className="px-4 py-12 md:py-20 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Usage Examples
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* English Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              English Newsletter
            </h3>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`<Newsletter
  language="en"
  variant="default"
/>`}
            </pre>
          </div>

          {/* French Example */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              French Newsletter
            </h3>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`<Newsletter
  language="fr"
  variant="default"
/>`}
            </pre>
          </div>

          {/* Custom Text English */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Custom English Text
            </h3>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`<Newsletter
  language="en"
  title="Join Our Community"
  subtitle="Stay updated with news"
  variant="gradient"
/>`}
            </pre>
          </div>

          {/* Custom Text French */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Custom French Text
            </h3>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`<Newsletter
  language="fr"
  title="Rejoignez Notre Communauté"
  subtitle="Restez à jour avec l'actualité"
  variant="gradient"
/>`}
            </pre>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12 md:py-20 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Features
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🌍 Multi-Language Support
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Full English and French translations for all text elements
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🎨 Multiple Variants
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Default, dark, and gradient design variations
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                📱 Fully Responsive
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Looks perfect on mobile, tablet, and desktop screens
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🎯 Form Validation
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Email validation and error handling with localized messages
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🔐 Privacy Focused
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Privacy message displayed in selected language
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                ⚡ Loading States
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Animated loading indicators with localized text
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Props Reference */}
      <section className="px-4 py-12 md:py-20 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Component Props
        </h2>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-300 dark:border-gray-700">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Prop
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Default
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              <tr>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">language</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                    'en' | 'fr'
                  </code>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                    'en'
                  </code>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  Language for translations
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">variant</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                    'default' | 'dark' | 'gradient'
                  </code>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                    'default'
                  </code>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  Design variant
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">title</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                    string
                  </code>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  Translation-based
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  Newsletter title
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">subtitle</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                    string
                  </code>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  Translation-based
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  Newsletter subtitle
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">placeholder</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                    string
                  </code>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  Translation-based
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  Email input placeholder
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">buttonText</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                    string
                  </code>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  Translation-based
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  Subscribe button text
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">fullWidth</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                    boolean
                  </code>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                    false
                  </code>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  Full width container
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
