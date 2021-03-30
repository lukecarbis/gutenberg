/**
 * WordPress dependencies
 */
import { Button, ButtonGroup, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';
import { createBlock } from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';

const PAGE_FIELDS = [ 'id', 'title', 'link', 'type', 'parent' ];
const MAX_PER_PAGE = 100; // we're limited to a max of 100

export const convertSelectedBlockToNavigationLinks = ( {
	pages,
	clientId,
	replaceBlock,
} ) => () => {
	//TODO: handle resolving state
	//TODO: test performance for lots of pages
	//TODO: add related aria-labels
	if ( ! pages ) {
		return;
	}

	const linkMap = {};
	const navigationLinks = [];

	//TODO: Current mapping assuming a sensible sort order with parents appearing in the list before children. Add unit test cases / throw some unexpected data at the sort.
	pages.forEach( ( { id, title, link: url, type, parent } ) => {
		linkMap[ id ] = createBlock(
			'core/navigation-link',
			{
				id,
				label: title.rendered, //TODO: raw or rendered?
				url,
				type,
				kind: 'post-type',
			},
			[]
		);

		if ( ! parent ) {
			navigationLinks.push( linkMap[ id ] );
		} else {
			const parentLinkInnerBlocks = linkMap[ parent ].innerBlocks;
			parentLinkInnerBlocks.push( linkMap[ id ] );
		}
	} );

	replaceBlock( clientId, navigationLinks );
};

export default function ConvertToLinksModal( { onClose, clientId } ) {
	const pages = useSelect(
		( select ) => {
			const { getPages } = select( coreDataStore );
			return getPages( {
				per_page: MAX_PER_PAGE,
				_fields: PAGE_FIELDS,
				orderby: 'menu_order',
			} );
		},
		[ clientId ]
	);
	const { replaceBlock } = useDispatch( blockEditorStore );

	return (
		<Modal
			closeLabel={ __( 'Close' ) }
			onRequestClose={ onClose }
			title={ __( 'Convert to Links' ) }
			className={ 'wp-block-page-list-modal' }
		>
			<p>
				{ __(
					'To edit this navigation menu, convert it to single page links. This allows you to add re-order, remove items, or edit their labels.'
				) }
			</p>
			<p>
				{ __(
					"Note: if you add new pages to your site, you'll need to add them to your navigation menu."
				) }
			</p>
			<ButtonGroup className={ 'wp-block-page-list-modal-buttons' }>
				<Button isSecondary onClick={ onClose }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					isPrimary
					onClick={ convertSelectedBlockToNavigationLinks( {
						pages,
						replaceBlock,
						clientId,
					} ) }
				>
					{ __( 'Convert' ) }
				</Button>
			</ButtonGroup>
		</Modal>
	);
}
